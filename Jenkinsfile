pipeline {
    agent any

    environment {
        DISCORD_WEBHOOK_URL = credentials('discord-webhook-internal')
        FULL_PATH_BRANCH = "${sh(script:'git name-rev --name-only HEAD', returnStdout: true).trim()}"
        BRANCH_NAME = FULL_PATH_BRANCH.substring(FULL_PATH_BRANCH.lastIndexOf('/') + 1, FULL_PATH_BRANCH.length())
        PROJECT_NAME = 'FANTADC'
    }

    stages {
        stage('Pre-Build Notification') {
            steps {
                script {
                    discordSend description: "The build process has started for the FantaDC project. [DEV]",
                            footer: "#${env.BUILD_NUMBER}",
                            link: env.BUILD_URL,
                            result: "SUCCESS",
                            title: "[${env.PROJECT_NAME}] [${env.BRANCH_NAME}] [DEV] Build STARTED",
                            webhookURL: env.DISCORD_WEBHOOK_URL
                }
            }
        }

        stage('Deploy Application') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'fantadc-db-dev',
                        usernameVariable: 'POSTGRES_USER',
                        passwordVariable: 'POSTGRES_PASSWORD'
                    ),
                    string(
                        credentialsId: 'fantadc-nextauth-secret-dev',
                        variable: 'NEXTAUTH_SECRET'
                    )
                ]) {
                    script {
                        def encodedUser = java.net.URLEncoder.encode(env.POSTGRES_USER, 'UTF-8').replace('+', '%20')
                        def encodedPassword = java.net.URLEncoder.encode(env.POSTGRES_PASSWORD, 'UTF-8').replace('+', '%20')

                        withEnv([
                            'POSTGRES_DB=fantadc',
                            'NEXTAUTH_URL=https://fantadc.gferruzzi.it',
                            "APP_DATABASE_URL=postgresql://${encodedUser}:${encodedPassword}@postgres:5432/fantadc",
                        ]) {
                            sh 'docker network create fantadc_net || true'
                            // 1. Avvia solo il DB e attendi che sia healthy (max 60s)
                            sh 'docker compose up -d postgres'
                            sh '''
                                echo "Waiting for postgres to be healthy..."
                                for i in $(seq 1 30); do
                                    STATUS=$(docker inspect --format="{{.State.Health.Status}}" fantadc-postgres 2>/dev/null || echo "missing")
                                    echo "  attempt $i: $STATUS"
                                    [ "$STATUS" = "healthy" ] && echo "Postgres is healthy." && break
                                    [ $i -eq 30 ] && echo "Timed out waiting for postgres." && exit 1
                                    sleep 2
                                done
                            '''
                            // 2. Avvia l'app con un DATABASE_URL gia escapato
                            sh 'docker compose up -d --build fantadc'
                            // 3. Attendi che il container sia up, poi migra + seed con la stessa URL
                            sh '''
                                sleep 10
                                docker exec -e DATABASE_URL="$APP_DATABASE_URL" fantadc sh -c 'npx prisma db push --accept-data-loss --url "$DATABASE_URL"'
                                docker exec -e DATABASE_URL="$APP_DATABASE_URL" fantadc sh -c 'npx prisma db seed'
                            '''
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            script {
                discordSend description: "The FantaDC build process completed successfully. [DEV]",
                        footer: "#${env.BUILD_NUMBER}",
                        link: env.BUILD_URL,
                        result: "SUCCESS",
                        title: "[${env.PROJECT_NAME}] [${env.BRANCH_NAME}] [DEV] Build SUCCEEDED",
                        webhookURL: env.DISCORD_WEBHOOK_URL
            }
        }
        failure {
            script {
                discordSend description: "The FantaDC build process failed. Please check the logs. [DEV]",
                        footer: "#${env.BUILD_NUMBER}",
                        link: env.BUILD_URL,
                        result: "FAILURE",
                        title: "[${env.PROJECT_NAME}] [${env.BRANCH_NAME}] [DEV] Build FAILED",
                        webhookURL: env.DISCORD_WEBHOOK_URL
            }
        }
        always {
            cleanWs(cleanWhenNotBuilt: true,
                    deleteDirs: true,
                    disableDeferredWipeout: false,
                    notFailBuild: true,
                    patterns: [])
        }
    }
}

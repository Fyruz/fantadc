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
                    sh 'docker network create fantadc_net || true'
                    // 1. Avvia solo il DB e attendi che sia healthy (max 60s)
                    sh """
                        POSTGRES_USER=${POSTGRES_USER} POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
                        docker compose up -d postgres
                    """
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
                    // 2. Avvia l'app
                    sh """
                        NEXTAUTH_URL=https://fantadc.gferruzzi.it \
                        docker compose up -d --build fantadc
                    """
                    // 3. Attendi che il container sia up, poi migra + seed
                    sh '''
                        sleep 10
                        echo "=== DATABASE_URL in container ==="
                        docker exec fantadc sh -c 'node -e "const u=process.env.DATABASE_URL||\"NOT_SET\"; console.log(u.replace(/:([^@:\/]+)@/,\":***@\"))"'
                        docker exec fantadc npx prisma db push --accept-data-loss
                        docker exec fantadc npx prisma db seed
                    '''
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

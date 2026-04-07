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
                    // 1. Avvia solo il DB e attendi che sia healthy
                    sh """
                        POSTGRES_USER=${POSTGRES_USER} POSTGRES_PASSWORD=${POSTGRES_PASSWORD} \
                        docker compose up -d postgres
                    """
                    sh 'docker compose wait postgres || true'
                    // 2. Applica schema e seed tramite il builder stage (ha prisma + tsx)
                    sh """
                        docker build --target builder -t fantadc-migrator:latest .
                        docker run --rm \
                            --network fantadc_dev_internal \
                            -e DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/fantadc" \
                            fantadc-migrator:latest \
                            sh -c "npx prisma db push --accept-data-loss && npx prisma db seed"
                    """
                    // 3. Avvia l'app
                    sh """
                        NEXTAUTH_URL=https://fantadc.gferruzzi.it \
                        AUTH_TRUST_HOST=true \
                        docker compose up -d --build fantadc
                    """
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

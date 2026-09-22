
pipeline {
    agent any

    tools {
        nodejs 'Node22'
    }

    environment {
        DOCKER_IMAGE = 'amarnath0011/hostel-complaints'
    }

    stages {

        stage('Check Environment') {
            steps {
                sh '''
                    echo "Node version:"
                    node --version

                    echo "NPM version:"
                    npm --version

                    echo "Docker version:"
                    docker --version

                    echo "Docker Buildx version:"
                    docker buildx version
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Generate Prisma Client') {
            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Build Next.js Application') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Login') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {
                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                            -u "$DOCKER_USERNAME" \
                            --password-stdin
                    '''
                }
            }
        }

        stage('Build and Push Multi-Platform Docker Image') {
            steps {
                sh '''
                    echo "Creating Docker Buildx builder..."

                    docker buildx create \
                        --name jenkins-builder \
                        --driver docker-container \
                        --use || true

                    docker buildx inspect --bootstrap

                    echo "Building Docker image for AMD64 and ARM64..."

                    docker buildx build \
                        --platform linux/amd64,linux/arm64 \
                        --tag ${DOCKER_IMAGE}:latest \
                        --push \
                        .
                '''
            }
        }

        stage('Verify Docker Image') {
            steps {
                sh '''
                    echo "Verifying pushed image..."

                    docker buildx imagetools inspect ${DOCKER_IMAGE}:latest
                '''
            }
        }
    }

    post {
        success {
            echo '=========================================='
            echo 'CI/CD PIPELINE SUCCESSFUL'
            echo '=========================================='
            echo "Docker image pushed:"
            echo "${DOCKER_IMAGE}:latest"
            echo 'Platforms: linux/amd64 + linux/arm64'
            echo '=========================================='
        }

        failure {
            echo '=========================================='
            echo 'CI/CD PIPELINE FAILED'
            echo 'Check the stage logs above.'
            echo '=========================================='
        }

        always {
            sh 'docker logout || true'
        }
    }
}

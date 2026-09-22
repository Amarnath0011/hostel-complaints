pipeline {
    agent any

    tools {
        nodejs 'Node22'
    }

    environment {
        DOCKER_IMAGE = 'amarnath0011/hostel-complaints'
        EC2_HOST = '13.127.48.231'
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
                        credentialsId: 'dockerhub',
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

        stage('Deploy to EC2') {
            steps {
                withCredentials([
                    sshUserPrivateKey(
                        credentialsId: 'ec2-ssh-key',
                        keyFileVariable: 'SSH_KEY',
                        usernameVariable: 'SSH_USER'
                    )
                ]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no \
                            -i "$SSH_KEY" \
                            "$SSH_USER@$EC2_HOST" << 'EOF'

                        set -e

                        echo "Pulling latest image..."
                        docker pull amarnath0011/hostel-complaints:latest

                        echo "Stopping old container..."
                        docker stop hostel-complaints || true

                        echo "Removing old container..."
                        docker rm hostel-complaints || true

                        echo "Starting new container..."
                        docker run -d \
                            --name hostel-complaints \
                            --restart unless-stopped \
                            -p 3000:3000 \
                            --env-file ~/.env \
                            amarnath0011/hostel-complaints:latest

                        echo "Waiting for application..."
                        sleep 5

                        echo "Checking container..."
                        docker ps --filter "name=hostel-complaints"

                        echo "Cleaning unused Docker images..."
                        docker image prune -f

EOF
                    '''
                }
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
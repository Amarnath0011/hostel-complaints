
pipeline {
    agent any
    
    tools {
        nodejs 'node22'
    }

    stage('Check Node') {
            steps {
                sh 'node --version'
                sh 'npm --version'
            }
        }

    stages {

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

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
    }
}


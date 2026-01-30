pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        NEXUS_CREDENTIALS = 'nexus-credentials' 
        
        DOCKERHUB_CREDENTIALS = 'docker-hub' 
        DOCKERHUB_USERNAME = 'hichemch1'         
        IMAGE_NAME = "${DOCKERHUB_USERNAME}/backend"        
        IMAGE_TAG = "${env.BUILD_NUMBER}"                  
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Hichemch-stack/devops-project.git'
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker compose up -d mysql'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('SonarQube Analysis - Backend') {
            steps {
                dir('backend') {
                    withSonarQubeEnv('sonarqube') {
                        sh 'mvn clean verify sonar:sonar'
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 2, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Deploy to Nexus') {
            steps {
                dir('backend') {
                    withCredentials([usernamePassword(
                        credentialsId: "${NEXUS_CREDENTIALS}",
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )]) {
                        sh './mvnw deploy -DskipTests -Dnexus.username=$NEXUS_USER -Dnexus.password=$NEXUS_PASSWORD'
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                echo "🐳 Build Docker image ${IMAGE_NAME}:${IMAGE_TAG}"
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Push Docker Image') {
            steps {
                echo "🚀 Push Docker image to Docker Hub"
                script {
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKERHUB_CREDENTIALS}") {
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push("latest")
                    }
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
                // Attendre que MySQL soit prêt
                sh '''
                echo "Waiting for MySQL to be ready..."
                until docker exec mysql mysqladmin ping -h "localhost" --silent; do
                    sleep 2
                done
                echo "MySQL is ready."
                '''
            }    
        } 
    }

    post {
        success {
            echo '🎉 CI/CD pipeline executed successfully!'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}


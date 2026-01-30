pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'

        // Nexus
        NEXUS_CREDENTIALS = 'nexus-credentials'

        // Docker Hub
        DOCKERHUB_CREDENTIALS = 'docker-hub'  
        DOCKERHUB_USERNAME = 'hichemch1'
        IMAGE_NAME = 'hichemch1/backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
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

        stage('SonarQube Analysis') {
            steps {
                dir('backend') {
                    withSonarQubeEnv('sonarqube') {
                        sh './mvnw clean verify sonar:sonar'
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
                        credentialsId: NEXUS_CREDENTIALS,
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )]) {
                        sh """
                        ./mvnw deploy -DskipTests \
                          -Dnexus.username=$NEXUS_USER \
                          -Dnexus.password=$NEXUS_PASSWORD
                        """
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                dir('backend') {
                    sh """
                    docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .
                    """
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                withCredentials([string(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    variable: 'DOCKER_TOKEN'
                )]) {
                    sh """
                    echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${IMAGE_NAME}:${IMAGE_TAG}
                    docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest
                    docker push ${IMAGE_NAME}:latest
                    docker logout
                    """
                }
            }
        }

        stage('Deploy Containers') {
            steps {
                sh 'docker compose down'
                sh 'docker compose up -d'
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


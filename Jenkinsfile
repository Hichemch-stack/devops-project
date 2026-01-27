pipeline {
    agent any

    environment {
        DOCKER_IMAGE_NAME = "hichemch1/devops-project" // change ton nom Docker Hub
        DOCKER_TAG = "latest"
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Récupération du code source"
                checkout scm
            }
        }

        stage('Build Docker Images') {
            steps {
                echo "Build multi-stage Docker pour Backend + Frontend"
                
                // Login Docker Hub
                withCredentials([usernamePassword(credentialsId: 'DOCKER_HUB_CREDENTIALS', 
                                                 usernameVariable: 'DOCKER_USER', 
                                                 passwordVariable: 'DOCKER_PASS')]) {
                    sh 'docker login -u $DOCKER_USER -p $DOCKER_PASS'
                }

                // Build de l'image Docker (multi-stage)
                sh """
                    docker build -t ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} .
                """
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo "Push image sur Docker Hub"
                sh """
                    docker push ${DOCKER_IMAGE_NAME}:${DOCKER_TAG}
                """
            }
        }

        stage('Clean up') {
            steps {
                echo "Suppression des images locales pour libérer de l'espace"
                sh """
                    docker rmi ${DOCKER_IMAGE_NAME}:${DOCKER_TAG} || true
                """
            }
        }
    }

    post {
        success {
            echo "Pipeline terminé avec succès"
        }
        failure {
            echo "Pipeline échoué"
        }
    }
}


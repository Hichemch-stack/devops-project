pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'

        // Nexus
        NEXUS_CREDENTIALS = 'nexus-credentials'

        // Docker Hub
        DOCKERHUB_CREDENTIALS = 'docker-hub'
        DOCKERHUB_USERNAME = 'hichemch1'

        // Backend image
        BACKEND_IMAGE = 'hichemch1/backend'
        BACKEND_TAG = "${BUILD_NUMBER}"

        // Frontend image
        FRONTEND_IMAGE = 'hichemch1/frontend'
        FRONTEND_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Hichemch-stack/devops-project.git'
            }
        }

        /* ===================== BACKEND ===================== */

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'docker compose up -d mysql'
                    sh './mvnw clean package -DskipTests'
                }
            }
        }

        stage('SonarQube Backend') {
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

        stage('Deploy Backend to Nexus') {
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

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh """
                    docker build -t ${BACKEND_IMAGE}:${BACKEND_TAG} .
                    """
                }
            }
        }

        stage('Push Backend Docker Image') {
            steps {
                withCredentials([string(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    variable: 'DOCKER_TOKEN'
                )]) {
                    sh """
                    echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${BACKEND_IMAGE}:${BACKEND_TAG}
                    docker tag ${BACKEND_IMAGE}:${BACKEND_TAG} ${BACKEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:latest
                    docker logout
                    """
                }
            }
        }

        /* ===================== FRONTEND ===================== */

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                    npm install
                    npm run build --prod
                    '''
                }
            }
        }

        stage('SonarQube Frontend') {
            steps {
                dir('frontend') {
                    withSonarQubeEnv('sonarqube') {
                        sh '''
                        sonar-scanner \
                          -Dsonar.projectKey=frontend \
                          -Dsonar.projectName=DevOps-Frontend \
                          -Dsonar.sources=src \
                          -Dsonar.language=ts \
                          -Dsonar.sourceEncoding=UTF-8
                        '''
                    }
                }
            }
        }

        stage('Deploy Frontend to Nexus') {
            steps {
                dir('frontend') {
                    withCredentials([usernamePassword(
                        credentialsId: NEXUS_CREDENTIALS,
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )]) {
                        sh '''
                        zip -r frontend-${BUILD_NUMBER}.zip dist
                        curl -u $NEXUS_USER:$NEXUS_PASSWORD \
                          --upload-file frontend-${BUILD_NUMBER}.zip \
                          http://192.168.56.20:8082/repository/maven-releases/frontend/frontend-${BUILD_NUMBER}.zip
                        '''
                    }
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh """
                    docker build -t ${FRONTEND_IMAGE}:${FRONTEND_TAG} .
                    """
                }
            }
        }

        stage('Push Frontend Docker Image') {
            steps {
                withCredentials([string(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    variable: 'DOCKER_TOKEN'
                )]) {
                    sh """
                    echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${FRONTEND_IMAGE}:${FRONTEND_TAG}
                    docker tag ${FRONTEND_IMAGE}:${FRONTEND_TAG} ${FRONTEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:latest
                    docker logout
                    """
                }
            }
        }

        /* ===================== DEPLOY ===================== */

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


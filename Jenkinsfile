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

        stage('Set Git Tag') {
            steps {
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                }
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
		
        // ======= Déploiement Maven =========
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

        // ======= Docker Backend =========
        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh """
                    docker build -t ${BACKEND_IMAGE}:${BACKEND_TAG} \
                                 -t ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT} .
                    """
                }
            }
        }
		

        stage('Push Backend Docker Image') {
            steps {
                withCredentials([string(credentialsId: DOCKERHUB_CREDENTIALS, variable: 'DOCKER_TOKEN')]) {
                    sh """
                    echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${BACKEND_IMAGE}:${BACKEND_TAG}
                    docker push ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}
                    docker tag ${BACKEND_IMAGE}:${BACKEND_TAG} ${BACKEND_IMAGE}:latest
                    docker push ${BACKEND_IMAGE}:latest
                    docker logout
                    """
                }
            }
        }

        /* ===================== FRONTEND ===================== */
		
		
		stage('Build Frontend') {
			agent {
				docker { image 'node:20-alpine' }
			}
			steps {
				dir('frontend') {
						sh 'npm ci'
						sh 'npm run build --prod'
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
                        sh """
                            zip -r frontend-${FRONTEND_TAG}.zip dist
                            curl -u $NEXUS_USER:$NEXUS_PASSWORD \
                                --upload-file frontend-${FRONTEND_TAG}.zip 
                        """
                    }
                }
            }
        }
		
		stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh """
                    docker build -t ${FRONTEND_IMAGE}:${FRONTEND_TAG} \
                                 -t ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT} .
                    """
                }
            }
        }
		
        stage('Push Frontend Docker Image') {
            steps {
                withCredentials([string(credentialsId: DOCKERHUB_CREDENTIALS, variable: 'DOCKER_TOKEN')]) {
                    sh """
                    echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                    docker push ${FRONTEND_IMAGE}:${FRONTEND_TAG}
                    docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}
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

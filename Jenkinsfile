pipeline {
    agent any

    environment {
        // ================= GLOBAL =================
        DOCKER_BUILDKIT = '1'
        MAVEN_OPTS = "-Dmaven.repo.local=$WORKSPACE/.m2"

        // ================= NEXUS =================
        NEXUS_CREDENTIALS = 'nexus-credentials'
        NEXUS_URL = 'http://192.168.56.30:8082'

        // ================= DOCKER HUB =================
        DOCKERHUB_CREDENTIALS = 'docker-hub'
        DOCKERHUB_USERNAME = 'hichemch1'

        // ================= IMAGES =================
        BACKEND_IMAGE  = 'hichemch1/backend'
        FRONTEND_IMAGE = 'hichemch1/frontend'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        skipStagesAfterUnstable()
    }

    stages {

        /* ===================== CHECKOUT ===================== */

	stage('Checkout') {
    		steps {
        		git branch: 'main',
            			url: 'https://github.com/Hichemch-stack/devops-project.git',
            			credentialsId: 'github_token'
        		script {
            			env.GIT_COMMIT_SHORT = sh(
                			script: "git rev-parse --short HEAD",
                			returnStdout: true
            			).trim()

            			env.BACKEND_TAG  = "${BUILD_NUMBER}-${GIT_COMMIT_SHORT}"
            			env.FRONTEND_TAG = "${BUILD_NUMBER}-${GIT_COMMIT_SHORT}"
        		}
    		}
	}

        /* ===================== BACKEND ===================== */
        stage('Build Backend') {
            steps {
                sh 'docker compose up -d mysql'
                dir('backend') {
                    sh './mvnw -B clean package -DskipTests'
                }
            }
        }

        stage('Backend Unit Tests') {
            steps {
                dir('backend') {
                    sh './mvnw test'
                }
            }
            post {
                always {
                    junit 'backend/target/surefire-reports/*.xml'
                }
            }
        }

        stage('SonarQube Backend') {
            steps {
                dir('backend') {
                    withSonarQubeEnv('sonarqube') {
                        sh './mvnw sonar:sonar'
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
                        sh '''
                            ./mvnw deploy -DskipTests \
                              -Dnexus.username=$NEXUS_USER \
                              -Dnexus.password=$NEXUS_PASSWORD
                        '''
                    }
                }
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                dir('backend') {
                    sh '''
                        docker build \
                          -t ${BACKEND_IMAGE}:${BACKEND_TAG} \
                          -t ${BACKEND_IMAGE}:latest .
                    '''
                }
            }
        }

        stage('Push Backend Docker Image') {
            steps {
                withCredentials([string(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    variable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                        docker push ${BACKEND_IMAGE}:${BACKEND_TAG}
                        docker push ${BACKEND_IMAGE}:latest
                        docker logout
                    '''
                }
            }
        }

        /* ===================== FRONTEND ===================== */
        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        docker run --rm \
                          -v "$PWD":/app \
                          -w /app \
                          node:20-alpine \
                          sh -c "
                            npm ci &&
                            npm run build
                          "
                    '''
                    stash name: 'frontend-dist', includes: 'dist/**'
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
                              -Dsonar.sources=src
                        '''
                    }
                }
            }
        }

        stage('Deploy Frontend to Nexus') {
            steps {
                dir('frontend') {
                    unstash 'frontend-dist'
                    archiveArtifacts artifacts: 'dist/**', fingerprint: true

                    withCredentials([usernamePassword(
                        credentialsId: NEXUS_CREDENTIALS,
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASSWORD'
                    )]) {
                        sh '''
                            tar -czf frontend.tar.gz -C dist .
                            curl -u "$NEXUS_USER:$NEXUS_PASSWORD" \
                              --upload-file frontend.tar.gz \
                              ${NEXUS_URL}/repository/frontend/frontend.tar.gz
                        '''
                    }
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                dir('frontend') {
                    sh '''
                        docker build \
                          -t ${FRONTEND_IMAGE}:${FRONTEND_TAG} \
                          -t ${FRONTEND_IMAGE}:latest .
                    '''
                }
            }
        }

        stage('Push Frontend Docker Image') {
            steps {
                withCredentials([string(
                    credentialsId: DOCKERHUB_CREDENTIALS,
                    variable: 'DOCKER_TOKEN'
                )]) {
                    sh '''
                        echo "$DOCKER_TOKEN" | docker login -u ${DOCKERHUB_USERNAME} --password-stdin
                        docker push ${FRONTEND_IMAGE}:${FRONTEND_TAG}
                        docker push ${FRONTEND_IMAGE}:latest
                        docker logout
                    '''
                }
            }
        }

        /* ===================== DEPLOY ===================== */
        stage('Deploy Containers') {
            steps {
                sh 'docker compose up -d --build'
            }
        }
    }

    post {
        success {
            echo '✅ CI/CD pipeline exécuté avec succès'
        }
        failure {
            echo '❌ Pipeline failed'
        }
    }
}


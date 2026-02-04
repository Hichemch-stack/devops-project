pipeline {
    agent any

    environment {
        // ================= GLOBAL =================
        DOCKER_BUILDKIT = '1'

        // ================= NEXUS =================
        NEXUS_CREDENTIALS = 'nexus-credentials'

        // ================= DOCKER HUB =================
        DOCKERHUB_CREDENTIALS = 'docker-hub'
        DOCKERHUB_USERNAME    = 'hichemch1'

        // ================= IMAGES =================
        BACKEND_IMAGE  = 'hichemch1/backend'
        FRONTEND_IMAGE = 'hichemch1/frontend'

        // ================= CACHE =================
        MAVEN_OPTS      = "-Dmaven.repo.local=$WORKSPACE/.m2"
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
                checkout scm
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
            	    junit 'target/surefire-reports/*.xml'
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
                        ./mvnw -B deploy -DskipTests \
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
                    				rm -rf node_modules &&
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
				script {
					def scannerHome = tool 'sonar-scanner'
					withSonarQubeEnv('sonarqube') {
						sh """
						${scannerHome}/bin/sonar-scanner \
							-Dsonar.projectKey=frontend \
							-Dsonar.projectName=DevOps-Frontend \
							-Dsonar.sources=src
							"""
					}
				}
			}
		}
	}

	stage('Deploy Frontend to Nexus') {
    		steps {
        		dir('frontend') {

            			// Récupération du build Angular
           	 		unstash 'frontend-dist'

            			// Archive Jenkins (optionnel mais utile)
            			archiveArtifacts artifacts: 'dist/**', fingerprint: true

            			withCredentials([usernamePassword(
                			credentialsId: 'nexus-credentials',
                			usernameVariable: 'NEXUS_USER',
                			passwordVariable: 'NEXUS_PASSWORD'
            			)]) {

                			sh '''
                			echo " Creating frontend.tar.gz..."
                                        tar -czf frontend.tar.gz -C dist .

                			echo " Uploading frontend.tar.gz to Nexus..."
                			curl -u "$NEXUS_USER:$NEXUS_PASSWORD" \
                     				--upload-file frontend.tar.gz \
                     				http://192.168.56.20:8082/repository/frontend/frontend.tar.gz
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
                sh '''
                    docker compose down
                    docker compose up -d
                '''
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


pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
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
					// Build Maven inside Docker with network of docker-compose
					sh '''
					docker run --rm \
					--network=host \
					-v $PWD:/app \
					-w /app \
					maven:3.9.2-openjdk-17 \
					mvn clean package -DskipTests
					'''
				}
			}
		}

		stage('SonarQube Analysis - Backend') {
			steps {
				dir('backend') {
					withSonarQubeEnv('sonarqube') {
						sh '''
						docker run --rm \
						--network=host \
						-v $PWD:/app \
						-w /app \
						maven:3.9.2-openjdk-17 \
						mvn clean verify sonar:sonar
						'''
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

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
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

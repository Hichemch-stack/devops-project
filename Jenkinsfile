pipeline {
    agent any

    tools {
        maven 'Maven-3.9'
        jdk 'JDK17'
    }

    environment {
        SONAR_PROJECT_KEY = "devops-backend"
        SONAR_PROJECT_NAME = "DevOps Backend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    sh 'mvn clean verify'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                withSonarQubeEnv('sonarqube') {
                    dir('backend') {
                        sh """
                        mvn sonar:sonar \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.projectName="${SONAR_PROJECT_NAME}" \
                          -Dsonar.host.url=http://sonarqube:9000 \
                          -Dsonar.login=${SONAR_AUTH_TOKEN}
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo '✅ SonarQube analysis completed successfully'
        }
        failure {
            echo '❌ SonarQube analysis failed'
        }
    }
}


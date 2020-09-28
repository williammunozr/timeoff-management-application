pipeline { 

    environment { 
        registry = "hachikoapp/timeoff-management-app" 
        registryCredential = 'dockerHubId' 
        dockerImage = '' 

        GIT_COMMIT_SHORT = sh(
                script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
                returnStdout: true
        )
    }

    agent any 

    stages { 

        stage('Building our image') { 
            steps { 
                script { 
                    dockerImage = docker.build registry + ":$GIT_COMMIT_SHORT" 
                }
            } 
        }

        stage('Deploy our image') { 
            steps { 
                script { 
                    docker.withRegistry( '', registryCredential ) { 
                        dockerImage.push() 
                    }
                } 
            }
        } 

        stage('Cleaning up') { 
            steps { 
                sh "docker rmi $registry:$GIT_COMMIT_SHORT" 
            }
        } 

        stage('EKS Deployment'){
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'awsAccountId', variable: 'AWS_ACCOUNT_ID')
                    ]) {
                        kubernetesDeploy(configs: "timeoffapp/timeoffapp-service.yaml", kubeconfigId: "eksKubeConfigFile", enableConfigSubstitution: true)
                        
                    }
                }
            }
        }
    }
}
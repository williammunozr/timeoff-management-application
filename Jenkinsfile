pipeline { 

    environment { 

        // Variables

        REGION_ID = "us-east-2"
        REGISTRY = "hachikoapp/timeoff-management-app" 
        dockerImage = '' 

        GIT_COMMIT_SHORT = sh(
                script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
                returnStdout: true
        )

        // Getting Secrets

        ACCOUNT_ID = credentials('AWS_ACCOUNT_ID')
        DB_ENDPOINT = credentials('DB_ENDPOINT')
        DB_NAME = credentials('DB_NAME')
        DB_USERNAME = credentials('DB_USERNAME')
        DB_PASSWORD = credentials('DB_PASSWD')
        DB_DIALECT = credentials('DB_DIALECT')
        
        registryCredential = 'dockerHubId' 

    }

    agent any 

    stages { 

        stage('Building our image') { 
            steps { 
                script { 
                    dockerImage = docker.build("${REGISTRY}:${env.GIT_COMMIT_SHORT}")
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
                sh "docker rmi $REGISTRY:$GIT_COMMIT_SHORT" 
            }
        } 

        stage('EKS Deployment') {
            steps {
                script {
                    //docker.image('alpine/k8s:1.14.9').inside('-u 0:1000 -v /jenkins/.ssh:/root/.ssh') {
                        sh """
                            aws eks --region $REGION_ID update-kubeconfig --name eks-cluster
                            
                            sed -i 's/{{ACCOUNT_ID}}/$ACCOUNT_ID/g' timeoffapp/timeoffapp-service.yaml
                            kubectl apply -f timeoffapp/timeoffapp-service.yaml

                            sed -i 's/{{TAG}}/$GIT_COMMIT_SHORT/g' timeoffapp/timeoffapp-deployment.yaml
                            sed -i 's/{{DB_ENDPOINT}}/$DB_ENDPOINT/g' timeoffapp/timeoffapp-deployment.yaml
                            sed -i 's/{{DB_NAME}}/$DB_NAME/g' timeoffapp/timeoffapp-deployment.yaml
                            sed -i 's/{{DB_USERNAME}}/$DB_USERNAME/g' timeoffapp/timeoffapp-deployment.yaml
                            sed -i 's/{{DB_PASSWORD}}/$DB_PASSWORD/g' timeoffapp/timeoffapp-deployment.yaml
                            sed -i 's/{{DB_DIALECT}}/$DB_DIALECT/g' timeoffapp/timeoffapp-deployment.yaml
                            kubectl apply -f timeoffapp/timeoffapp-deployment.yaml

                            kubectl get pods,svc
                        """
                    //}
                }
            }
        }
    }
}
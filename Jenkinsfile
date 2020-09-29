pipeline { 

    environment { 
        REGION_ID = "us-east-2"
        ACCOUNT_ID = credentials('AWS_ACCOUNT_ID')
        REGISTRY = "hachikoapp/timeoff-management-app" 
        registryCredential = 'dockerHubId' 
        dockerImage = '' 

        GIT_COMMIT_SHORT = sh(
                script: "printf \$(git rev-parse --short ${GIT_COMMIT})",
                returnStdout: true
        )

        RDS_ENDPOINT = credentials('rds_endpoint')

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
                            sed -i 's/#ACCOUNT_ID#/$ACCOUNT_ID/g' timeoffapp/timeoffapp-service.yaml
                            kubectl apply -f timeoffapp/timeoffapp-service.yaml
                            kubectl get pods,svc
                        """
                    //}
                }
            }
        }
        // sh "sed -i 's/hello:latest/hello:${env.BUILD_ID}/g' deployment.yaml"


    }
}
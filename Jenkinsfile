pipeline { 

    environment { 
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
                    docker.image('alpine/k8s:1.14.9').inside('-u 0:1000 -v /jenkins/.ssh:/root/.ssh -v /jenkins/.aws:/root/.aws') {
                        sh """
                            aws eks --region us-east-2 update-kubeconfig --name eks-cluster
                            kubectl get nodes
                            kubectl create -f timeoffapp/timeoffapp-service.yaml
                        """
                    }
                }
            }
        }
        // sh "sed -i 's/hello:latest/hello:${env.BUILD_ID}/g' deployment.yaml"


    }
}
pipeline { 

    environment { 

        // Variables

        REGION_ID = "us-east-2"
        EKS_CLUSTER_NAME = "eks-cluster"
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

        stage('Building Timeoff Image') { 
            steps { 
                script { 
                    sh 'pwd'
                    dockerImage = docker.build("${REGISTRY}:${env.GIT_COMMIT_SHORT}")
                }
            } 
        }

        stage('Deploy Timeoff Image') { 
            steps { 
                script { 
                    docker.withRegistry( '', registryCredential ) { 
                        dockerImage.push() 
                    }
                } 
            }
        } 

        stage('Cleaning Up') { 
            steps { 
                sh "docker rmi $REGISTRY:$GIT_COMMIT_SHORT" 
            }
        } 

        /* 
            Since Jul-2020 is not working
            https://github.com/jenkinsci/kubernetes-cd-plugin/issues/134
            ERROR: Can't construct a java object for tag:yaml.org,2002:io.kubernetes.client.openapi.models.V1Deployment; exception=Class not found: io.kubernetes.client.openapi.models.V1Deployment
        stage('Deploy on kubernetes') {
            steps {
                kubernetesDeploy(
                    kubeconfigId: 'eks_kubeconfig',
                    configs: 'timeoffapp/*.yaml',
                    enableConfigSubstitution: true
                )
            }
        }*/

        stage('Timeoff Deployment to EKS') {
            steps {
                script {
                    //docker.image('alpine/k8s:1.14.9').inside('-u 0:1000 -v /jenkins/.ssh:/root/.ssh') {
                        sh """
                            aws eks --region $REGION_ID update-kubeconfig --name $EKS_CLUSTER_NAME
                            
                            sed -i 's/{{ACCOUNT_ID}}/$ACCOUNT_ID/g' timeoffapp/timeoffapp-service.yaml
                            kubectl apply -f timeoffapp/timeoffapp-service.yaml

                            sed -i 's/{{TAG}}/$GIT_COMMIT_SHORT/g' timeoffapp/timeoffapp-deployment.yaml
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
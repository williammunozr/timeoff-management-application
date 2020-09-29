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
        AWS_ACCESS_KEY_ID = credentials('AWS_ACCESS_KEY_ID')
        AWS_SECRET_ACCESS_KEY = credentials('AWS_SECRET_ACCESS_KEY')
        AWS_DEFAULT_REGION = credentials('AWS_DEFAULT_REGION')

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
                    withEnv(['AWS_ACCESS_KEY_ID=xkjhfsdhfjkasdhjk', 'AWS_SECRET_ACCESS_KEY=jkashdfkjashdfjksad', 'AWS_DEFAULT_REGION=us-east-2']) {
                        docker.image('alpine/k8s:1.14.9').inside('-u 0:1000 -v /jenkins/.ssh:/root/.ssh') {
                            sh """
                                export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
                                export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
                                export AWS_DEFAULT_REGION=$AWS_DEFAULT_REGION
                                aws eks --region $AWS_DEFAULT_REGION update-kubeconfig --name eks-cluster
                            """
                        }
                    }
                }
            }
        }
        // sh "sed -i 's/hello:latest/hello:${env.BUILD_ID}/g' deployment.yaml"


    }
}
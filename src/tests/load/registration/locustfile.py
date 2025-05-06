# from locust import HttpUser, task

# class RegistrationUser(HttpUser):
#     @task
#     def hello_world(self):
#         self.client.get('/')
import random
import string
from locust import HttpUser, between, task

class HelloWorldUser(HttpUser):
    wait_time = between(1, 5) # pause 1 to 5 secs between requests
    
    # load the register endpoint
    @task
    def hello_world(self):
        self.client.get("/")
        
    def randomUserGenerator(self,):
        random_number = ''.join(random.choices(string.digits, k=10))

        # Generate a random username
        username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=8))
        email = f"{username}@example.com"

        
        return {
            "firstName": "First",
            "lastName": "paul", 
            "phone": random_number,
            "dob": "1986-04-06",
            "sex": 1,
            "password": "password",
            "email": email
        }
    
        
    def on_start(self):
        json = self.randomUserGenerator()
        self.client.post('/users', json=json)
        

# IDATT2901 Bachelor Thesis

## Contents
- [Description](#Description)
- [Setup](#Setup)
    - [Dependencies](#Dependencies)
    - [Installation](#Installation)
- [Running the application](#Running-the-application)
- [Running tests](#Running-tests)
- [Documentation](#Documentation)
- [Contribution](#Contribution)

## Description
This project is a part of a bachelors thesis done at NTNU Trondheim. The system is a tool made to increase efficiency by enabeling easier information retrieval from documents, made with next-gen agile in mind. The system uses LLMs in order to retrieve, as well as verify spesific data elements from project files.

## Setup
### Dependencies
TBA

### Installation
First clone the repository and navigate to the root folder of the project in your terminal.

Create the .env file withe the following content in the root folder:
```
API_TOKEN = Huggingface Llama 3.1 8B instruct api token
```
API token can be obtained on huggingface or you can ask one of the developers for their token for the day.
https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct

#### Backend
To set up the backend, begin by activating the virtual environment. For Mac/Linux use the command:  
```
source .venv/bin/activate
```
For Windows use:
```
.venv\Scripts\Activate
```
Next, install the dependencies using the command: 
```
python -m pip install -r requirements.txt 
```
To close the virtual enviroment, use the command:
```
deactivate 
```

#### Frontend
To set up the backend, navigate to the frontend folder:
```
cd frontend
```
Next, install dependencies:
```
npm install
```
## Running the application
### Backend
To run the backend, navigate to the source code folder from the root:
```
cd src
```
Then run main.py using the command:
```
python -m fastapi dev main.py
```
### Frontend
To run the frontend, navigate to the frontend folder from the root:
```
cd frontend
```
Then run the application using the command:
```
npm run dev
```
## Running tests
TBA

## Documentation
Code should be documented with docstrings. For a more detailed description of the project see the wiki.

## Contribution
To contribute to the project you have to create a new branch, then make changes on the branch. When you are finnished you make a pull request to main and if no pipelines fail you are free to merge. To ensure pull requests take as little time as possible tests and checkstyle should be performed locally before atempting to merge. For large additions or changes the pull request should be rewieved by atleast one other contributor before merging.

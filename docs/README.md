# IDATT2901 Bachelor Thesis

## Contents
- [Description](#description)
- [Setup](#setup)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
- [Running the application](#running-the-application)
- [Terminating the application](#running-the-application)
- [Running tests](#Running-tests)
- [Documentation](#Documentation)
- [Contribution](#Contribution)

## Description
This project is a part of a bachelors thesis done at NTNU Trondheim. The system is a tool made to increase efficiency by enabling easier information retrieval from documents, made with next-gen agile in mind. The system uses LLMs in order to retrieve, as well as verify specific data elements from project files.

## Setup
### Prerequisites
Before installing the project, ensure you have the following installed correctly:

```bash
git --version
python --version
node --version
npm --version
```

Expected output:
- Git 2.x+
- Python 3.11+
- Node.js 18+
- npm

### Installation
To begin, clone the repository using:
```bash
git clone https://github.com/C-Corapi/IDATT2901_Bachelor_Thesis.git
cd IDATT2901_Bachelor_Thesis
```

Then, activate a virtual environment.

For Mac/Linux:
```bash
python -m venv .venv
source .venv/bin/activate
```

For Windows Command Prompt:
```bat
python -m venv .venv
.venv\Scripts\activate
```

For Windows PowerShell:
```powershell
.venv\Scripts\Activate.ps1
```

Next, install the dependencies.

Backend dependencies:
```bash
python -m pip install -r requirements.txt
```

Frontend dependencies:
```bash
cd frontend
npm install
```
If you prefer a reproducible frontend install based on package-lock.json, use:
```bash
cd frontend
npm ci
```

### Environment Variables
This system requires environment variables for access to the LLM.

Before running the application, create a `.env` file in the project root and add the required access token.

Required variables:
- `API_TOKEN`: your Hugging Face access token

Use your own access token unless you have been provided one.

This system uses the model `meta-llama/Llama-3.1-8B`. You can request free access to it via Hugging Face.

## Running the application
Run the backend and frontend in separate terminals. The run order does not matter, but some frontend functionality will be unavailable until the backend is running, too.

Backend:

```bash
cd src
python -m fastapi dev main.py
```

Frontend:

```bash
cd frontend
npm run dev
```

## Terminating the application
To stop the backend or frontend, return to the relevant terminal and press:

```bash
CTRL + C
```
You will need to do this in both terminals to terminate the application completely.

To close the virtual environment enter:
```bash
deactivate
```

## Running tests
To run the backend unit tests, from the project folder run:
```
pytest
```
To get a coverage report run:
```
pytest --cov="src"
```

To run the frontend unit tests, run;

```bash
cd frontend
npm run test:unit
```

To get a coverage report of the frontend unit tests, run: 

```bash
cd frontend
npm run test:coverage:unit
```

To run the frontend integration tests, run;

```bash
cd frontend
npm run test:integration
```

To get a coverage report of the frontend unit tests, run: 

```bash
cd frontend
npm run test:coverage:integration
```

To run the frontend end to end tests headless, run;

```bash
cd frontend
npm run cypress:run
```

To run the frontend end to end tests in cypress, run;

```bash
cd frontend
npm run cypress:open
```

## Documentation
Code should be documented with docstrings. For a more detailed description of the project see the wiki.

## Contribution
To contribute to the project you have to create a new branch, then make changes on the branch. When you are finished you make a pull request to main and if no pipelines fail you are free to merge. To ensure pull requests take as little time as possible tests and checkstyle should be performed locally before attempting to merge. For large additions or changes the pull request should be reviewed by at least one other contributor before merging.

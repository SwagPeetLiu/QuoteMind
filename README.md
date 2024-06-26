# QuotMind

This projct is dedicated to my hardworking mother who needs to manually do price quoting on all transactions made on a weekly basis. This project aims to automate process of a UX design & marketing company's pricing procedures.

# Prerequisites
front-end
  - Vue -- framework for interact with the end-users (await to be developed)
  - Tailwind -- utilty first CSS
  - Bootstrap5 -- for pre-made components

back-end
  - node.js -- running express as the backend server
  - jwt -- jsonwebtoken for authorisation purposes with session expiration settings
  - bcrypt -- bcryptjs for storing the hashed user passwords
  - validator - user input safety checks for both validity and length
  - Postgresql -- relational database used to keep track of all entities, using pg-promise client to establish DB connection
  - uuid-ossp -- enforcing universal & fixed long string (128 bits)
  - dot-env -- keep track of environmental settings of the express server

# deployment
AWS 
  - RDS, EC2

# project management
  - Jira - used to track development progress and the business requirements analysis on QuoteMind
  - Confluence - Docuemntations on Techncial Stack Learnigns and 

# Installation
  1. navigate to the folder of Express-Server to run npm install 
  2. run npm run devStart

# Usage
  1. Manage and create companies/ clients/ addresses / employees/ products/ materials / transactions
  2. Ability of drag & drop of a folder with a specific naming convension for designs (i.e., folder name contains the product, materials, date, etc.)
  3. Auote and refine the business logics to auotemate further on the price determinations

# Contributing & Contact
Please contact me on 535051192liu@gmail.com if you are interest in improving your development skills like me!

# License
Permission of the front-end develoepr first application is provided for free from creative-tim
  - Copyright 2021 [Creative Tim](https://www.creative-tim.com?ref=readme-vsud)
  - Creative Tim [license](https://www.creative-tim.com/license?ref=readme-vsud)

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Workshop } from '../types';

// Mock workshop data
const mockWorkshops: Workshop[] = [
  {
    id: 'ai-vibe-python-workshop',
    title: 'AI Vibe Coding Workshop',
    shortDescription: 'Learn Python coding with Cursor IDE and AI assistance',
    description: 'This 3-session workshop introduces you to Python programming with a focus on using AI tools to enhance your coding workflow. You\'ll learn how to set up a proper Python environment, leverage Cursor IDE\'s AI features, and build practical projects with AI assistance. Perfect for beginners who want to start coding with modern tools.',
    instructor: {
      name: 'Maya Chen',
      bio: 'Python developer and AI educator with 5+ years of experience teaching coding workshops.',
      photoURL: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    difficulty: 'Beginner',
    topic: 'Python',
    sessions: [
      {
        id: 'ai-vibe-session-1',
        title: 'Python Setup & Environment Basics',
        description: 'Learn how to set up Python, Cursor IDE, manage packages, and work with environment variables.',
        duration: '1 hour',
        date: '2023-07-15T10:00:00Z',
        content: `
## Session 1: Python Setup & Environment Basics

### Objectives
- Install Python and Cursor IDE
- Understand Python packages
- Set up project environments
- Learn about environment variables

### Detailed Agenda

#### 1. Getting Started (30 minutes)
- **Python Installation**
  - Download Python 3.x from python.org
  - Verify installation with \`python3 --version\`
  - Introduction to Python REPL

- **Cursor IDE Setup**
  - Download and install Cursor IDE from https://cursor.sh/
  - Overview of the Cursor interface
  - Key features and differences from VS Code
  - Workspace configuration

- **Anthropic API Configuration**
  - Create an Anthropic account at console.anthropic.com
  - Generate your API key
  - In Cursor: Navigate to Settings > Extensions > AI > Claude Token
  - Paste your Anthropic API key
  - Test the connection with the AI chat panel (Cmd+L)

#### 2. Python Packages (10 minutes)
- **Package Ecosystem**
  - Understanding the Python package ecosystem
  - PyPI and popular libraries
  - Package dependencies and versioning

- **Pip Package Manager**
  - Using pip to install packages
  - Basic commands:
    \`\`\`bash
    pip install requests
    pip install pandas numpy matplotlib
    pip list
    pip show requests
    pip uninstall package_name
    \`\`\`

- **Requirements Files**
  - Creating requirements.txt
  - Freezing dependencies:
    \`\`\`bash
    pip freeze > requirements.txt
    \`\`\`
  - Installing from requirements:
    \`\`\`bash
    pip install -r requirements.txt
    \`\`\`

#### 3. Python Environments (10 minutes)
- **Virtual Environments**
  - Why use virtual environments
  - Creating environments:
    \`\`\`bash
    python -m venv myenv
    \`\`\`
  - Activating environments:
    \`\`\`bash
    # On Mac/Linux
    source myenv/bin/activate
    # On Windows
    myenv\\Scripts\\activate
    \`\`\`
  - Deactivating: \`deactivate\`

- **Environment Management**
  - Creating project-specific environments
  - Switching between environments
  - Installing packages in isolated environments

#### 4. Environment Variables (10 minutes)
- **Environment Variable Basics**
  - What are environment variables
  - System vs. user vs. session variables

- **Setting Variables**
  - In terminal:
    \`\`\`bash
    export API_KEY="your_key_here"
    echo $API_KEY
    \`\`\`
  - Persistence in .bash_profile or .zshrc

- **Project Environment Variables**
  - Using .env files
  - Creating a .env file:
    \`\`\`
    API_KEY=your_key_here
    DEBUG=True
    \`\`\`
  - Installing python-dotenv:
    \`\`\`bash
    pip install python-dotenv
    \`\`\`

- **Accessing in Python**
  - Reading environment variables:
    \`\`\`python
    import os
    api_key = os.environ.get("API_KEY")
    
    # With dotenv
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.environ.get("API_KEY")
    \`\`\`

### Homework Assignment
1. Install Python and Cursor IDE
2. Create a new project with a virtual environment
3. Install at least 2 packages and create a requirements.txt
4. Create a .env file with a sample API key
5. Write a simple script that reads and uses the environment variable
`,
      },
      {
        id: 'ai-vibe-session-2',
        title: 'AI-Assisted Coding with Cursor',
        description: 'Master Cursor\'s AI features, learn effective prompting techniques, and start coding with AI assistance.',
        duration: '1 hour',
        date: '2023-07-22T10:00:00Z',
        content: `
## Session 2: AI-Assisted Coding with Cursor

### Objectives
- Use Cursor's AI features effectively
- Learn basic prompt techniques
- Begin coding with AI assistance

### Detailed Agenda

#### 1. Cursor AI Features (25 minutes)
- **AI Code Completion**
  - How Cursor's AI completion differs from regular autocomplete
  - Using Tab to accept suggestions
  - Generating entire functions and blocks
  - Customizing completion behavior

- **AI Chat Panel**
  - Opening the chat panel (Cmd+L)
  - Asking questions about your code
  - Getting explanations of complex functions
  - Generating code snippets from descriptions

- **Code Explanation**
  - Highlighting code and asking for explanations
  - Understanding unfamiliar code
  - Getting documentation for functions

- **Key Shortcuts**
  - Cmd+L: Open AI chat
  - Cmd+K: Generate code
  - Cmd+J: Explain selected code
  - Cmd+I: Improve selected code
  - Cmd+;: Edit selected code

- **Practical Demonstration**
  - Live examples of each feature
  - Common use cases
  - When to use (and not use) AI assistance

#### 2. Basic Prompting (20 minutes)
- **Effective Prompting Principles**
  - Being specific and clear
  - Providing context
  - Specifying format and constraints
  - Iterative refinement

- **Prompt Examples**
  - Bad: "Write a function"
  - Good: "Write a Python function that takes a list of numbers and returns the average, handling empty lists by returning 0"

- **Context Setting**
  - Explaining your project
  - Defining requirements
  - Specifying coding style
  - Example:
    \`\`\`
    I'm building a data processing tool that needs to read CSV files.
    Write a function that:
    1. Takes a filename as input
    2. Reads the CSV into a pandas DataFrame
    3. Handles common errors like missing files
    4. Returns the DataFrame or None if there's an error
    Use try/except blocks for error handling.
    \`\`\`

- **Refining AI Output**
  - Evaluating generated code
  - Asking for improvements
  - Requesting explanations of complex parts
  - Iterating on solutions

- **Practice Session**
  - Students write prompts for simple tasks
  - Group review of effective prompts
  - Refining prompts based on feedback

#### 3. Simple AI Projects (15 minutes)
- **Data Parser Project**
  - Using AI to generate a CSV/JSON parser
  - Prompt: "Create a function that parses a CSV file with headers and converts it to a list of dictionaries"
  - Refining the solution

- **Utility Functions**
  - Generating helper functions
  - Example: "Write a set of utility functions for string manipulation including: capitalizing first letter of each word, removing special characters, and truncating to a specific length"

- **Debugging with AI**
  - Presenting broken code to AI
  - Asking for error identification
  - Getting fix suggestions
  - Example prompt: "This function is supposed to count word frequency in a text file but it's not working. Please identify the issues and fix it."

### Homework Assignment
1. Create a small tool using AI assistance (suggestions):
   - A text analyzer that counts words, sentences, and paragraphs
   - A simple web scraper that extracts information from a webpage
   - A file organizer that sorts files by type into folders
2. Document the prompts you used and how you refined them
3. Be prepared to share your experience in the next session
`,
      },
      {
        id: 'ai-vibe-session-3',
        title: 'Project Organization & Practical Application',
        description: 'Learn proper project structure, Git version control, and build a complete mini-project with AI assistance.',
        duration: '1 hour',
        date: '2023-07-29T10:00:00Z',
        content: `
## Session 3: Project Organization & Practical Application

### Objectives
- Set up proper project structure
- Use Git for version control
- Build a complete mini-project with AI assistance

### Detailed Agenda

#### 1. Project Organization (15 minutes)
- **Folder Structure Best Practices**
  - Standard Python project layout:
    \`\`\`
    project_name/
    ├── README.md
    ├── requirements.txt
    ├── .env
    ├── .gitignore
    ├── project_name/
    │   ├── __init__.py
    │   ├── main.py
    │   ├── utils.py
    │   └── config.py
    ├── data/
    ├── tests/
    └── docs/
    \`\`\`
  - Separating concerns (logic, data, configuration)
  - Module organization

- **Configuration Management**
  - Config files vs. environment variables
  - Using config.py for application settings
  - Separating dev/prod configurations

- **Documentation Basics**
  - Writing effective READMEs
    - Project description
    - Installation instructions
    - Usage examples
    - Dependencies
  - Code comments and docstrings
  - Using AI to generate documentation

#### 2. Git Version Control (15 minutes)
- **Git Basics in Cursor**
  - Initializing a repository:
    \`\`\`bash
    git init
    \`\`\`
  - Cursor's Git integration features
  - Source control panel overview

- **Essential Git Commands**
  - Staging changes:
    \`\`\`bash
    git add filename
    git add .
    \`\`\`
  - Committing:
    \`\`\`bash
    git commit -m "Add feature X"
    \`\`\`
  - Checking status:
    \`\`\`bash
    git status
    \`\`\`
  - Viewing history:
    \`\`\`bash
    git log
    \`\`\`

- **Python-specific .gitignore**
  - Creating a .gitignore file
  - Common Python patterns to ignore:
    \`\`\`
    # Environments
    venv/
    env/
    .env
    
    # Python cache
    __pycache__/
    *.py[cod]
    *$py.class
    
    # Distribution / packaging
    dist/
    build/
    *.egg-info/
    
    # Local data
    data/
    *.csv
    *.json
    \`\`\`

- **Commit Best Practices**
  - Writing meaningful commit messages
  - Atomic commits (one change per commit)
  - When to commit
  - Using AI to suggest commit messages based on changes

#### 3. Mini-Project Workshop (30 minutes)
- **Project: Data Analysis Tool**
  - A script that:
    1. Reads data from a CSV file
    2. Performs basic analysis (stats, filtering, etc.)
    3. Generates visualizations
    4. Exports results to a report

- **Step-by-Step Development**
  - Setting up the project structure
  - Creating a virtual environment
  - Installing dependencies (pandas, matplotlib)
  - Using AI to generate code components:
    - Data loading function
    - Analysis functions
    - Visualization code
    - Report generation

- **Error Handling Implementation**
  - Adding robust error handling
  - Validating input data
  - Graceful failure modes
  - Using AI to suggest error handling strategies

- **Testing and Refinement**
  - Manual testing with sample data
  - Refining the solution
  - Performance considerations
  - Code cleanup and documentation

- **Group Sharing**
  - Students present their solutions
  - Discussion of different approaches
  - Feedback and improvement suggestions

### Final Project Assignment
1. Extend the mini-project or create a new project of your choice
2. Apply all concepts learned:
   - Proper environment setup
   - AI-assisted coding
   - Good project structure
   - Git version control
   - Documentation
3. Submit your project to the shared repository
4. Include a README with:
   - Project description
   - Installation instructions
   - How AI was used in development
   - Challenges and solutions
`,
      },
    ],
    prerequisites: [
      'Mac system',
      'Basic terminal familiarity',
      'GitHub account',
      'No prior Python experience required'
    ],
    materials: [
      'Python Setup Guide',
      'Cursor IDE Cheat Sheet',
      'AI Prompting Best Practices',
      'Project Structure Templates',
      'Sample Code Repository'
    ],
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=800&q=80',
    startDate: '2023-07-15T10:00:00Z',
    endDate: '2023-07-29T11:00:00Z',
    capacity: 20,
    registeredUsers: 12,
  },
  {
    id: 'javascript-web-dev',
    title: 'Modern JavaScript Web Development',
    shortDescription: 'Master modern JavaScript frameworks and tools',
    description: 'This comprehensive workshop covers modern JavaScript development practices, frameworks like React and Vue, and tools that make web development efficient and enjoyable. You\'ll build real-world projects and learn best practices from industry experts.',
    instructor: {
      name: 'Sarah Chen',
      bio: 'Frontend developer and educator specializing in JavaScript frameworks and performance optimization.',
      photoURL: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    difficulty: 'Intermediate',
    topic: 'JavaScript',
    sessions: [
      {
        id: 'js-web-1',
        title: 'Modern JavaScript Essentials',
        description: 'Learn ES6+ features and modern JavaScript patterns.',
        duration: '2 hours',
        date: '2023-07-10T14:00:00Z',
        content: 'Session content will be available after registration.',
      },
      {
        id: 'js-web-2',
        title: 'React Fundamentals',
        description: 'Build interactive UIs with React.',
        duration: '2 hours',
        date: '2023-07-17T14:00:00Z',
        content: 'Session content will be available after registration.',
      },
      {
        id: 'js-web-3',
        title: 'State Management and APIs',
        description: 'Manage application state and connect to backend services.',
        duration: '2 hours',
        date: '2023-07-24T14:00:00Z',
        content: 'Session content will be available after registration.',
      },
      {
        id: 'js-web-4',
        title: 'Performance Optimization',
        description: 'Techniques to make your web apps faster and more efficient.',
        duration: '2 hours',
        date: '2023-07-31T14:00:00Z',
        content: 'Session content will be available after registration.',
      },
    ],
    prerequisites: [
      'Basic HTML and CSS knowledge',
      'Familiarity with JavaScript fundamentals',
      'Understanding of web development concepts',
    ],
    materials: [
      'Modern JavaScript Handbook',
      'React project starter templates',
      'Performance optimization checklists',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=800&q=80',
    startDate: '2023-07-10T14:00:00Z',
    endDate: '2023-07-31T16:00:00Z',
    capacity: 25,
    registeredUsers: 22,
  },
  {
    id: 'ai-chatbot-development',
    title: 'Building AI-Powered Chatbots',
    shortDescription: 'Create intelligent conversational interfaces',
    description: 'Learn how to design, develop, and deploy AI-powered chatbots that can understand natural language and provide helpful responses. This workshop covers NLP techniques, conversation design, and integration with popular messaging platforms.',
    instructor: {
      name: 'Michael Rodriguez',
      bio: 'NLP specialist and chatbot architect who has built solutions for Fortune 500 companies.',
      photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
    },
    difficulty: 'Advanced',
    topic: 'AI',
    sessions: [
      {
        id: 'chatbot-1',
        title: 'Introduction to NLP and Chatbots',
        description: 'Understand the fundamentals of Natural Language Processing.',
        duration: '2 hours',
        date: '2023-08-05T15:00:00Z',
        content: 'Session content will be available after registration.',
      },
      {
        id: 'chatbot-2',
        title: 'Conversation Design Principles',
        description: 'Learn how to design effective conversational flows.',
        duration: '2 hours',
        date: '2023-08-12T15:00:00Z',
        content: 'Session content will be available after registration.',
      },
      {
        id: 'chatbot-3',
        title: 'Building with Dialogflow',
        description: 'Implement a chatbot using Google\'s Dialogflow platform.',
        duration: '2 hours',
        date: '2023-08-19T15:00:00Z',
        content: 'Session content will be available after registration.',
      },
      {
        id: 'chatbot-4',
        title: 'Custom NLP Models with Rasa',
        description: 'Build advanced chatbots with the open-source Rasa framework.',
        duration: '2 hours',
        date: '2023-08-26T15:00:00Z',
        content: 'Session content will be available after registration.',
      },
    ],
    prerequisites: [
      'Intermediate Python programming skills',
      'Basic understanding of machine learning concepts',
      'Familiarity with APIs and web services',
    ],
    materials: [
      'Chatbot Development Guide',
      'NLP model templates',
      'Conversation design toolkit',
    ],
    imageUrl: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&h=800&q=80',
    startDate: '2023-08-05T15:00:00Z',
    endDate: '2023-08-26T17:00:00Z',
    capacity: 20,
    registeredUsers: 15,
  },
];

// Function to set up mock data in Firestore
export const setupMockData = async () => {
  try {
    const workshopsCollection = collection(db, 'workshops');
    
    // Add each workshop to Firestore
    for (const workshop of mockWorkshops) {
      await setDoc(doc(workshopsCollection, workshop.id), workshop);
    }
    
    console.log('Mock data setup complete');
  } catch (error) {
    console.error('Error setting up mock data:', error);
  }
};

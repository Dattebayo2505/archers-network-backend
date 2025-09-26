# archers-network-backend
MMD Website Managers: Take Home Exam - Backend Challenge

## Program Setup (Decided to make a mini-webapp)

1. **Initialize npm project:**
    ```bash
    npm init -y
    ```

2. **Install Necessary Libraries:**
    ```bash 
    npm install
    ```

3. **Setup Environment File:**
    Create a `.env` file in the root directory with the following configuration:
    ```
    # MongoDB Configuration
    MONGODB_URI=NULL

    # Server Configuration
    PORT=NULL
    ```

4. **Setup MongoDB:**
    Create a MongoDB connection. Add to URI
    ```
    mongodb://localhost:27017/
    ```

5. **Preparation of sample data:**
    Sample populate database through
    ```bash
    npm run populate
    ```

6. **Start the program:**
    ```bash
    npm start
    ```


6. **View Frontend:**
    In a browser, visit 
    `
    localhost:[PORT]/index.html
    `
    Replace [PORT] with the port selected in the `.env`.


TY to CCAPDEV team for code references T_T
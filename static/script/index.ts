function splitAtFirstComma(row: string | string[]) {
    const index = row.indexOf(',');
    if (index === -1) return [row];
    const firstPart = row.slice(0, index);
    const secondPart = row.slice(index + 1);
    return [firstPart, secondPart];
}

function createTable(data: any[]): void {
    // create table
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.id = "userStoriesTable";
    // create header
    const rowHeader = document.createElement('tr');
    const thNumber = document.createElement('th');
    thNumber.innerHTML = "Index";
    const thUserStories = document.createElement('th');
    thUserStories.innerHTML = "User Story";
    // append header
    rowHeader.appendChild(thNumber);
    rowHeader.appendChild(thUserStories);
    table.appendChild(rowHeader);
    // create and append body
    for (let i = 0; i < data.length; i++) {
        const rowData = data[i];
        if (rowData.length === 1 && rowData[0] === '') {
            continue;
        }
        const row = document.createElement('tr');
        rowData.forEach((cell: string) => {
            const td = document.createElement('td');
            let cleanedCell = cell.replace(/^"|"$/g, '').trim();         
            cleanedCell = cleanedCell.replace(/"/g, '').trim()
            td.innerText = cleanedCell;
            td.style.border = '1px solid black';
            td.style.padding = '8px';
            row.appendChild(td);
        });
        table.appendChild(row);
    }
    // append table
    document.body.appendChild(table)
}

function createPromptBar(): void {
    // create section
    const sectionInput = document.getElementById('sectionInput') as HTMLElement;
    // create and append textarea element
    const inputElement = document.createElement('textarea');
    inputElement.id = 'userInput';
    inputElement.placeholder = 'Enter something...';
    inputElement.rows = 10
    sectionInput.appendChild(inputElement);
    // create and append upload file button
    const uploadButton = document.createElement('input');
    uploadButton.type = "file";
    uploadButton.id = 'uploadButton';
    uploadButton.innerText = 'Upload File';
    sectionInput.appendChild(uploadButton)
    // create and append submit button
    const submitButton = document.createElement('button');
    submitButton.id = 'submitBotton';
    submitButton.innerText = 'Submit';
    sectionInput.appendChild(submitButton);
    
    submitButton.addEventListener('click', () => {
        const userInput = (document.getElementById('userInput') as HTMLTextAreaElement).value;

        fetch('http://127.0.0.1:5001/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userInput }), 
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);
            const rows = data.response.split('\n');
            data = rows.map((row: string) => splitAtFirstComma(row));
            const table = document.getElementById("userStoriesTable")
            if(table) table.parentNode?.removeChild(table);
            createTable(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

createPromptBar();
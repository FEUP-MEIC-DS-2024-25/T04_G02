function getRowTable(row: string | string[]) {
    const index = row.indexOf(',');
    if (index === -1) return [row];
    const firstPart = row.slice(0, index);
    const secondPart = row.slice(index + 1);
    return [firstPart, secondPart];
}

function generateUserStories(dataInput: any){
    fetch('http://127.0.0.1:5001/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: dataInput }), 
    })
    .then(response => response.json())
    .then(data => {
        console.log('Response from server:', data);
        const rows = data.response.split('\n');
        data = rows.map((row: string) => getRowTable(row));
        const table = document.getElementById("userStoriesTable")
        if(table) table.parentNode?.removeChild(table);
        createTable(data);
    })
}

function createTable(data: any[]): void {
    
    // create table
    const table = document.createElement('table');
    table.style.borderCollapse = 'collapse';
    table.id = "userStoriesTable";
    
    // create and append body
    for (let i = 0; i < data.length; i++) {
        const rowData = data[i];

        if (rowData.length === 1 || rowData[0] === '' || rowData[1] == '' || !rowData[0] || !rowData[1]) {
            continue;
        }

        const row = document.createElement('tr');

        const td = document.createElement('td');
        let cleanedCell = rowData[1].replace(/^"|"$/g, '').trim();         
        cleanedCell = cleanedCell.replace(/"/g, '').trim()
        td.innerText = cleanedCell;
        td.style.border = '1px solid black';
        td.style.padding = '8px';
        
        if (rowData.indexOf(rowData[1]) === rowData.length - 1) {
            const feedbackDiv = document.createElement('div');
            feedbackDiv.className = 'feedback-container';
            
            const thumbsUpBtn = document.createElement('button');
            thumbsUpBtn.innerHTML = '<i class="far fa-thumbs-up"></i>';
            thumbsUpBtn.className = 'feedback-btn';
            thumbsUpBtn.onclick = () => handleFeedback(true, i-1);
            
            const thumbsDownBtn = document.createElement('button');
            thumbsDownBtn.innerHTML = '<i class="far fa-thumbs-down"></i>';
            thumbsDownBtn.className = 'feedback-btn';
            thumbsDownBtn.onclick = () => handleFeedback(false, i-1);
            
            feedbackDiv.appendChild(thumbsUpBtn);
            feedbackDiv.appendChild(thumbsDownBtn);
            td.appendChild(feedbackDiv);
        }     
    
        row.appendChild(td);
        table.appendChild(row);
    }

    let sectionUserStories = document.getElementById('sectionUserStories') as HTMLElement;
    if (sectionUserStories) {
        sectionUserStories.parentNode?.removeChild(sectionUserStories);
    }

    sectionUserStories = document.createElement('section');
    sectionUserStories.id = "sectionUserStories"
    
   
    const yesUserStoriesH = document.createElement('h3')
    yesUserStoriesH.id = "yesUserStoriesH";
    yesUserStoriesH.textContent = "Generated User Stories"

    const exportButton = document.createElement('button');
    exportButton.id = 'exportButton';
    exportButton.textContent = "Download"

    const regenerateButton = document.createElement('button');
    regenerateButton.id = 'regenerateButton';
    regenerateButton.textContent = "Regenerate"

    const tableContainer = document.createElement('div');
    tableContainer.id = 'tableContainer';

    const buttonContainer = document.createElement('div');
    buttonContainer.id = 'buttonContainer'

    buttonContainer.appendChild(exportButton)
    buttonContainer.appendChild(regenerateButton)
    tableContainer.appendChild(table);

    sectionUserStories.appendChild(yesUserStoriesH);
    sectionUserStories.appendChild(buttonContainer)
    sectionUserStories.appendChild(tableContainer);
    document.body.appendChild(sectionUserStories)
}

function handleFeedback(isPositive: boolean, index: number): void {
    const feedbackContainer = document.querySelectorAll(`#userStoriesTable tr:nth-child(${index + 2}) .feedback-container`)[0];
    const buttons = feedbackContainer.querySelectorAll('.feedback-btn i');
    
    buttons.forEach(icon => {
        icon.classList.remove('fas');
        icon.classList.add('far');
    });
    
    const selectedIcon = buttons[isPositive ? 0 : 1];
    selectedIcon.classList.remove('far');
    selectedIcon.classList.add('fas');
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
        const files = uploadButton.files;
        if(files && files?.length > 0 ){
            let combinedContent = '';
            const fileReaders: Promise<void>[] = [];
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                const fileReadPromise = new Promise<void>((resolve, reject) => {
                    reader.onload = (event) => {
                        const content = event.target?.result;
                        if (typeof content === 'string') {
                            combinedContent += content + '\n';
                            resolve();
                        } else {
                            reject(new Error('Error reading file as text'));
                        }
                    };
                    reader.onerror = (error) => {
                        reject(error);
                    };
                    reader.readAsText(file);
                });
                fileReaders.push(fileReadPromise);
            }
            Promise.all(fileReaders)
            .then(() => {
                const dataInput = combinedContent
                generateUserStories(dataInput)
            })
        }
        else {
            const dataInput = (document.getElementById('userInput') as HTMLTextAreaElement).value;
            generateUserStories(dataInput)
        }
    });
}

createPromptBar();

document.addEventListener('DOMContentLoaded', () => {
    const settingsButton = document.getElementById('settingsButton');
    const settingsDropdown = document.getElementById('settingsDropdown');
    const dueDateRadios = document.querySelectorAll('input[name="dueDate"]');
    const dueDatePicker = document.getElementById('dueDatePicker');

    settingsButton?.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsDropdown?.classList.toggle('show');
    });

    dueDateRadios.forEach((radio: Element) => {
        if (radio instanceof HTMLInputElement) {
            radio.addEventListener('change', () => {
                if (dueDatePicker) {
                    dueDatePicker.style.display = radio.value === 'set' ? 'block' : 'none';
                }
            });
        }
    });

    document.addEventListener('click', (e) => {
        if (settingsDropdown?.classList.contains('show') && 
            !settingsDropdown.contains(e.target as Node) && 
            e.target !== settingsButton) {
            settingsDropdown.classList.remove('show');
        }
    });
});
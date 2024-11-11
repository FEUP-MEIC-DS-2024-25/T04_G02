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
        //console.log('Response from server:',  data);
        const list = JSON.parse(data.response);
        console.log(list);
        //const rows = data.response.split('\n');
        //data = rows.map((row: string) => getRowTable(row));
        const table = document.getElementById("userStoriesTable")
        if(table) table.parentNode?.removeChild(table);
        createFakeTable(list, dataInput);
    })
}


function createFakeTable(data: any[], initialInput: any): void {
  /// create table
  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.id = "userStoriesTable";

  // create header
  const rowHeader = document.createElement('tr');
  const thNumber = document.createElement('th');
  thNumber.innerHTML = "Index";
  const thUserStories = document.createElement('th');
  thUserStories.innerHTML = "User Story";

  const feed = document.createElement('th');
  feed.innerHTML = "Feedback";
  // append header
  rowHeader.appendChild(thNumber);
  rowHeader.appendChild(thUserStories);
  rowHeader.appendChild(feed);
  table.appendChild(rowHeader);
  // create and append body
  data.forEach(rowData => {
        const row = document.createElement('tr');   
        const index = document.createElement('td');
        index.innerText = rowData.index;

        row.appendChild(index);

        

        const userStory = document.createElement('td');

        const userStoryDiv = document.createElement('div');

        const t =  document.createElement('p');
        t.innerText = rowData.user_story;

        userStoryDiv.appendChild(t);

        const feedback = document.createElement('td');
          
        const feedbackDiv = document.createElement('div');
        feedbackDiv.className = 'feedback-container';

        const acList = document.createElement('ul');
        acList.innerText = "Acceptance criteria"
        rowData.acceptance_criteria.forEach((ac:  string) =>{
            const ele = document.createElement('li');
            ele.innerText = ac;
            acList.appendChild(ele)
        })
        acList.addEventListener('click', function() {
            const itens = acList.querySelectorAll('li');
            
            let isAnyItemVisible = false;
            itens.forEach(item => {
              item.classList.toggle('show'); 
              if (item.classList.contains('show')) {
                isAnyItemVisible = true;
              }
            });
        
            if (isAnyItemVisible) {
                userStory.style.height = 'auto';
            } else {
                userStory.style.height = '';
            }
        })   

        userStoryDiv.appendChild(acList);

        userStory.appendChild(userStoryDiv)

        const thumbsUpBtn = document.createElement('button');
        thumbsUpBtn.innerHTML = '<i class="far fa-thumbs-up"></i>';
        thumbsUpBtn.className = 'feedback-btn';
        thumbsUpBtn.onclick = () => handleFeedback(true, feedbackDiv);
        
        const thumbsDownBtn = document.createElement('button');
        thumbsDownBtn.innerHTML = '<i class="far fa-thumbs-down"></i>';
        thumbsDownBtn.className = 'feedback-btn';
        thumbsDownBtn.onclick = () => handleFeedback(false, feedbackDiv);
        
        feedbackDiv.appendChild(thumbsUpBtn);
        feedbackDiv.appendChild(thumbsDownBtn);
        feedback.appendChild(feedbackDiv);
        
        row.appendChild(userStory);
        row.appendChild(feedback);
        table.appendChild(row);
  })
  
  document.body.appendChild(table);

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
    exportButton.addEventListener('click', () => downloadUserStoriesAsJson(data));

    const regenerateButton = document.createElement('button');
    regenerateButton.id = 'regenerateButton';
    regenerateButton.textContent = "Regenerate"
    regenerateButton.addEventListener('click', () => generateUserStories(initialInput));

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

function downloadUserStoriesAsJson(data: any[]): void {
    const jsonData = data.map(item => ({
        index: item.index,
        user_story: item.user_story,
        acceptance_criteria: item.acceptance_criteria
    }));

    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'user_stories.json'; 
    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);
}

/*
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
*/

function handleFeedback(isPositive: boolean,  feedbackContainer: HTMLDivElement): void {
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

    // Create container for file controls
    const fileControlsContainer = document.createElement('div');
    fileControlsContainer.id = 'fileControlsContainer';

    // create upload file button
    const uploadButton = document.createElement('input');
    uploadButton.type = "file";
    uploadButton.id = 'uploadButton';
    uploadButton.innerText = 'Upload File';
    fileControlsContainer.appendChild(uploadButton);

    // create delete button
    const deleteButton = document.createElement('button');
    deleteButton.id = 'deleteButton';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Remove File';
    deleteButton.style.display = 'none';
    fileControlsContainer.appendChild(deleteButton);

    sectionInput.appendChild(fileControlsContainer);

    // create and append submit button
    const submitButton = document.createElement('button');
    submitButton.id = 'submitBotton';
    submitButton.innerText = 'Submit';
    sectionInput.appendChild(submitButton);

    // Add event listeners
    uploadButton.addEventListener('change', () => {
        if (uploadButton.files && uploadButton.files.length > 0) {
            deleteButton.style.display = 'inline-block';
        } else {
            deleteButton.style.display = 'none';
        }
    });

    deleteButton.addEventListener('click', () => {
        uploadButton.value = '';
        deleteButton.style.display = 'none';
    });
    
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
function createPromptBar(): void {
    const inputElement = document.createElement('textarea');
    inputElement.id = 'userInput';
    inputElement.placeholder = 'Enter something...';
    inputElement.rows = 10

    const uploadButton = document.createElement('input');
    uploadButton.type = "file";
    uploadButton.id = 'uploadButton';
    uploadButton.innerText = 'Upload File';

    const submitButton = document.createElement('button');
    submitButton.id = 'submitBotton';
    submitButton.innerText = 'Submit';

    const displayContainer = document.createElement('div');
    displayContainer.id = 'responseContainer';

    const sectionInput = document.getElementById('sectionInput') as HTMLElement;
   
    sectionInput.appendChild(inputElement);
    sectionInput.appendChild(uploadButton)
    sectionInput.appendChild(submitButton);
    sectionInput.appendChild(displayContainer); 

    submitButton.addEventListener('click', () => {
        const userInput = (document.getElementById('userInput') as HTMLTextAreaElement).value;

        fetch('http://127.0.0.1:5000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: userInput }), 
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response from server:', data);

            const displayElement = document.createElement('p');
            displayElement.innerText = `${data.response}`;
            document.body.appendChild(displayElement);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

createPromptBar();
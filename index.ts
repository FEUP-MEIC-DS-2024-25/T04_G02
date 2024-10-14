function createPromptBar(): void {
    const inputElement = document.createElement('input');
    inputElement.type = 'text';
    inputElement.id = 'userInput';
    inputElement.placeholder = 'Enter something...';
    
    const submitButton = document.createElement('button');
    submitButton.innerText = 'Submit';

    const displayContainer = document.createElement('div');
    displayContainer.id = 'responseContainer';
    
    document.body.appendChild(inputElement);
    document.body.appendChild(submitButton);
    document.body.appendChild(displayContainer); 

    submitButton.addEventListener('click', () => {
        const userInput = (document.getElementById('userInput') as HTMLInputElement).value;

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

            displayContainer.innerHTML = '';

            const displayElement = document.createElement('p');
            displayElement.innerText = `${data.response}`;
            displayContainer.appendChild(displayElement);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
}

createPromptBar();
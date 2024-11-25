function getRowTable(row: string | string[]) {
    const index = row.indexOf(",");
    if (index === -1) return [row];
    const firstPart = row.slice(0, index);
    const secondPart = row.slice(index + 1);
    return [firstPart, secondPart];
}

function regenerationConfirmation(dataInput: any) {
    const userConfirmed = window.confirm(
        "Are you sure you want to continue the user stories regeneration process?"
    );

    if (userConfirmed) {
        generateUserStories(dataInput);
    } else {
        console.log("Regeneration canceled.");
    }
}

function generateUserStories(dataInput: any): Promise<void> {
    return fetch('http://127.0.0.1:5001/generate', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: dataInput }), 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const list = JSON.parse(data.response.replace('```json','').replace('```',''));
        const table = document.getElementById("userStoriesTable")
        if(table) table.parentNode?.removeChild(table);
        createFakeTable(list, dataInput);
    });
}

function generateTheme(dataInput: any) {
    fetch("http://localhost:5001/add_theme", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: dataInput }),
    })
        .then((response) => {
            response.json();
        })
        .then((data) => {
            console.log("Response from server:", data);
        });
}

function cleanSelect(idSelect: string) {
    const selectElement = document.getElementById(idSelect);
    if(!selectElement) return;
    while (selectElement.firstChild) {
      selectElement.removeChild(selectElement.firstChild);
    }
}

function getProjects() {
    fetch("http://localhost:5001/projects", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);}
        return response.json();
      })
      .then((data) => {
        console.log("Response from server:", data);
        const selectElement = document.getElementById('project-dropdown');
        if(!selectElement) return;
        while (selectElement.firstChild) {
            selectElement.removeChild(selectElement.firstChild);
        }
        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.text = "Select a Project"; 
        selectElement.appendChild(defaultOption)
        data.response.forEach((project: { id: any ; name: string; }) => {
            const optionElement = document.createElement('option');
            optionElement.value = project.id.toString();
            optionElement.text = project.name;
            selectElement.appendChild(optionElement);
        });
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
    });
}

function getProject(projectId: number) {
    fetch(`http://localhost:5001/project/${projectId}/content`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.statusText}`);}
        return response.json();
      })
      .then((data) => {
        console.log("Response from server:", data.response);
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
    });
}

function createFakeTable(data: any[], initialInput: any): void {
    /// create table
    const table = document.createElement("table");
    table.style.borderCollapse = "collapse";
    table.id = "userStoriesTable";

    // create header
    const rowHeader = document.createElement("tr");
    const thNumber = document.createElement("th");
    thNumber.innerHTML = "Index";
    const thUserStories = document.createElement("th");
    thUserStories.innerHTML = "User Story";

    const feed = document.createElement("th");
    feed.innerHTML = "Feedback";
    // append header
    rowHeader.appendChild(thNumber);
    rowHeader.appendChild(thUserStories);
    rowHeader.appendChild(feed);
    table.appendChild(rowHeader);
    // create and append body
    data.forEach((rowData) => {
        const row = document.createElement("tr");
        const index = document.createElement("td");
        index.innerText = rowData.index;

        row.appendChild(index);

        const userStory = document.createElement("td");

        const userStoryDiv = document.createElement("div");

        const t = document.createElement("p");
        t.innerText = rowData.user_story;

        userStoryDiv.appendChild(t);

        const feedback = document.createElement("td");

        const feedbackDiv = document.createElement("div");
        feedbackDiv.className = "feedback-container";

        const acList = document.createElement("ul");
        acList.innerText = "Acceptance criteria";
        rowData.acceptance_criteria.forEach((ac: string) => {
            const ele = document.createElement("li");
            ele.innerText = ac;
            acList.appendChild(ele);
        });
        acList.addEventListener("click", function () {
            const itens = acList.querySelectorAll("li");

            let isAnyItemVisible = false;
            itens.forEach((item) => {
                item.classList.toggle("show");
                if (item.classList.contains("show")) {
                    isAnyItemVisible = true;
                }
            });

            if (isAnyItemVisible) {
                userStory.style.height = "auto";
            } else {
                userStory.style.height = "";
            }
        });

        userStoryDiv.appendChild(acList);

        userStory.appendChild(userStoryDiv);

        const thumbsUpBtn = document.createElement("button");
        thumbsUpBtn.innerHTML = '<i class="far fa-thumbs-up"></i>';
        thumbsUpBtn.className = "feedback-btn";
        thumbsUpBtn.onclick = () => handleFeedback(true, feedbackDiv);

        const thumbsDownBtn = document.createElement("button");
        thumbsDownBtn.innerHTML = '<i class="far fa-thumbs-down"></i>';
        thumbsDownBtn.className = "feedback-btn";
        thumbsDownBtn.onclick = () => handleFeedback(false, feedbackDiv);

        feedbackDiv.appendChild(thumbsUpBtn);
        feedbackDiv.appendChild(thumbsDownBtn);
        feedback.appendChild(feedbackDiv);

        row.appendChild(userStory);
        row.appendChild(feedback);
        table.appendChild(row);
    });

    document.body.appendChild(table);

    let sectionUserStories = document.getElementById(
        "sectionUserStories",
    ) as HTMLElement;
    if (sectionUserStories) {
        sectionUserStories.parentNode?.removeChild(sectionUserStories);
    }

    sectionUserStories = document.createElement("section");
    sectionUserStories.id = "sectionUserStories";

    const yesUserStoriesH = document.createElement("h3");
    yesUserStoriesH.id = "yesUserStoriesH";
    yesUserStoriesH.textContent = "Generated User Stories";

    const exportButton = document.createElement("button");
    exportButton.id = "exportButton";
    exportButton.textContent = "Download";
    exportButton.addEventListener("click", () =>
        downloadUserStoriesAsJson(data),
    );

    const regenerateButton = document.createElement('button');
    regenerateButton.id = 'regenerateButton';
    regenerateButton.textContent = "Regenerate"
    regenerateButton.addEventListener('click', () => regenerationConfirmation(initialInput));

    const tableContainer = document.createElement("div");
    tableContainer.id = "tableContainer";

    const buttonContainer = document.createElement("div");
    buttonContainer.id = "buttonContainer";

    buttonContainer.appendChild(exportButton);
    buttonContainer.appendChild(regenerateButton);
    tableContainer.appendChild(table);

    sectionUserStories.appendChild(yesUserStoriesH);
    sectionUserStories.appendChild(buttonContainer);
    sectionUserStories.appendChild(tableContainer);
    document.body.appendChild(sectionUserStories);
}

function downloadUserStoriesAsJson(data: any[]): void {
    if (!Array.isArray(data)) {
        console.error("Invalid data: Expected an array.");
        return;
    }

    const jsonData = data.map((item, index) => {
        if (typeof item !== 'object' || item === null) {
            console.warn(`Item at index ${index} is not a valid object.`);
            return { index, user_story: "Invalid data", acceptance_criteria: "Invalid data" };
        }

        const { index: itemIndex, user_story, acceptance_criteria } = item;

        if (typeof itemIndex !== 'number' || typeof user_story !== 'string' || typeof acceptance_criteria !== 'string') {
            console.warn(`Invalid fields in item at index ${index}`);
            return {
                index: itemIndex ?? "Invalid index",
                user_story: user_story ?? "Invalid user story",
                acceptance_criteria: acceptance_criteria ?? "Invalid acceptance criteria"
            };
        }

        return { index: itemIndex, user_story, acceptance_criteria };
    });

    try {
        const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'user_stories.json'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error("An error occurred during the JSON download process:", error);
    }
}

function handleFeedback(
    isPositive: boolean,
    feedbackContainer: HTMLDivElement,
): void {
    const buttons = feedbackContainer.querySelectorAll(".feedback-btn i");

    buttons.forEach((icon) => {
        icon.classList.remove("fas");
        icon.classList.add("far");
    });

    const selectedIcon = buttons[isPositive ? 0 : 1];
    selectedIcon.classList.remove("far");
    selectedIcon.classList.add("fas");
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = [
    'text/plain',     
    'text/markdown',  
    'text/csv'        
];

function redirectToProject() {
    const selectElement = document.getElementById('project-dropdown') as HTMLSelectElement;
    if (!selectElement) {
      return;
    }
    const projectId = selectElement.value;
  
    if (projectId) {
      getProject(parseInt(projectId))
    }
}

function createPromptBar(): void {
    const sectionInput = document.getElementById('sectionInput') as HTMLElement;

    const divProject = document.createElement("div");
    divProject.id = "divProject"

    const projectSelect = document.createElement("select");
    projectSelect.id ="project-dropdown";
    projectSelect.onchange =  function() {
        redirectToProject();
    };

    const projectInput = document.createElement('input');
    projectInput.type = 'text';
    projectInput.id = 'projectInput';
    projectInput.placeholder = 'Project Name';

    divProject.appendChild(projectSelect)

    divProject.appendChild(projectInput)

    sectionInput.appendChild(divProject)
    
    // Create and append textarea element
    const inputElement = document.createElement('textarea');
    inputElement.id = 'userInput';
    inputElement.placeholder = 'Enter something...';
    inputElement.rows = 10;
    sectionInput.appendChild(inputElement);

    // Create container for file controls
    const fileControlsContainer = document.createElement('div');
    fileControlsContainer.id = 'fileControlsContainer';

    // Create file input error message element
    const errorMessage = document.createElement('div');
    errorMessage.id = 'fileError';
    errorMessage.style.color = 'red';
    errorMessage.style.display = 'none';
    fileControlsContainer.appendChild(errorMessage);

    // Create upload file button
    const uploadButton = document.createElement('input');
    uploadButton.type = "file";
    uploadButton.id = 'uploadButton';
    uploadButton.accept = '.txt,.md,.csv';  // Limited to simple text formats
    fileControlsContainer.appendChild(uploadButton);

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.id = 'deleteButton';
    deleteButton.innerHTML = '<i class="fas fa-trash"></i> Remove File';
    deleteButton.style.display = 'none';
    fileControlsContainer.appendChild(deleteButton);

    sectionInput.appendChild(fileControlsContainer);

    // Create and append submit button
    const submitButton = document.createElement('button');
    submitButton.id = 'submitBotton';
    submitButton.innerText = 'Submit';
    sectionInput.appendChild(submitButton);

    // Add event listeners
    uploadButton.addEventListener('change', (event) => {
        const target = event.target as HTMLInputElement;
        const files = target.files;
        errorMessage.style.display = 'none';
        
        if (files && files.length > 0) {
            const file = files[0];
            
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                errorMessage.textContent = 'File size exceeds 5MB limit';
                errorMessage.style.display = 'block';
                uploadButton.value = '';
                deleteButton.style.display = 'none';
                return;
            }
            
            // Validate file type
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                errorMessage.textContent = 'Only text files (.txt, .md, .csv) are supported';
                errorMessage.style.display = 'block';
                uploadButton.value = '';
                deleteButton.style.display = 'none';
                return;
            }
            
            deleteButton.style.display = 'inline-block';
        } else {
            deleteButton.style.display = 'none';
        }
    });

    deleteButton.addEventListener('click', () => {
        uploadButton.value = '';
        deleteButton.style.display = 'none';
        errorMessage.style.display = 'none';
    });
    
    submitButton.addEventListener('click', () => {
        const files = uploadButton.files;
        if (files && files?.length > 0) {
            const file = files[0];
            
            if (file.size > MAX_FILE_SIZE) {
                errorMessage.textContent = 'File size exceeds 5MB limit';
                errorMessage.style.display = 'block';
                return;
            }
            
            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                errorMessage.textContent = 'Only text files (.txt, .md, .csv) are supported';
                errorMessage.style.display = 'block';
                return;
            }
            
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result;
                if (typeof content === 'string') {
                    generateUserStories(content)
                        .catch(error => {
                            if (error.message.includes('429') || error.message.includes('Resource exhausted')) {
                                errorMessage.textContent = 'Server is busy. Please try again in a few moments or try with a smaller file.';
                                errorMessage.style.display = 'block';
                            } else {
                                errorMessage.textContent = 'Error processing file. Please try again.';
                                errorMessage.style.display = 'block';
                            }
                        });
                }
            };
            reader.onerror = () => {
                errorMessage.textContent = 'Error reading file. Please try again.';
                errorMessage.style.display = 'block';
            };
            reader.readAsText(file);
        } else {
            const dataInput = (document.getElementById('userInput') as HTMLTextAreaElement).value;
            generateUserStories(dataInput)
                .catch(error => {
                    if (error.message.includes('429') || error.message.includes('Resource exhausted')) {
                        errorMessage.textContent = 'Server is busy. Please try again in a few moments.';
                        errorMessage.style.display = 'block';
                    } else {
                        errorMessage.textContent = 'Error processing request. Please try again.';
                        errorMessage.style.display = 'block';
                    }
                });
        }
    });
}

createPromptBar();

getProjects();


document.addEventListener("DOMContentLoaded", () => {
    const settingsButton = document.getElementById("settingsButton");
    const settingsDropdown = document.getElementById("settingsDropdown");
    const dueDateRadios = document.querySelectorAll('input[name="dueDate"]');
    const dueDatePicker = document.getElementById("dueDatePicker");

    settingsButton?.addEventListener("click", (e) => {
        e.stopPropagation();
        settingsDropdown?.classList.toggle("show");
    });

    dueDateRadios.forEach((radio: Element) => {
        if (radio instanceof HTMLInputElement) {
            radio.addEventListener("change", () => {
                if (dueDatePicker) {
                    dueDatePicker.style.display =
                        radio.value === "set" ? "block" : "none";
                }
            });
        }
    });

    document.addEventListener("click", (e) => {
        if (
            settingsDropdown?.classList.contains("show") &&
            !settingsDropdown.contains(e.target as Node) &&
            e.target !== settingsButton
        ) {
            settingsDropdown.classList.remove("show");
        }
    });
});

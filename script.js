document.querySelector(".profile_info").style.display = "none";
document.querySelector(".repositories").style.display = "none";
document.querySelector(".repo-in-details").style.display = "none";

//this obj contain 2 api 1 for showing the iddetails and other to show repo details
const GitApi = {
    API: 'https://api.github.com/users/',

    async UserProfile(username) {
        const response = await fetch(`${this.API}${username}`);
        //not found error tackle krdiya
        if (response.status == 404) {
            throw new Error("User Nahin Milaa :((")
        }
        return response.json();
    },

    async UserRepo(username) {
        const response = await fetch(`${this.API}${username}/repos?per_page=100`);

        //error-handling koi-bhi-error
        if (!response.ok) {
            throw new Error("Repo nahin mili :((")
        }
        return response.json();
    }

}

//this ui obj fro css handling things for mainly the design part
const UI = {
    assivalue: {
        Searchbtn: document.getElementById("Searchbtn"),
        usernameinput: document.getElementById("Username-input"),
        repocards: document.getElementById("repo-cards"),
        repocard: document.getElementsByClassName("repo-card"),
        repoindetails: document.querySelector(".repo-in-details")
    },

    //ye function data naam ki json leraha h and profile m details dikha raha
    ProfileData(data) {
        document.querySelector(".profile").innerHTML = `
        <div class="profile">
                <img src="${data.avatar_url}" alt="">
                <div>
                    <h1 style="color:#310128a8;">${data.name}</h1> <br>
                    <div>@ ${data.login}</div> <br>
                    <div>${data.bio}</div> <br>
                    <div class="details_count">
                    <div><strong>${data.followers}</strong> <br> <span> Followers</span> <br></div>
                    <div><strong>${data.following}</strong> <br> <span> Following</span> <br></div>
                    <div><strong>${data.public_repos}</strong> <br> <span> Repositories</span></div>
                    </div>
                </div>
            </div>`
    },

    //ye fnc same as last one .json le raha and card ki details show kr raha
    DisplayCard(data) {
        //ye ko past cards details ko delete kr deta h
        this.assivalue.repocards.innerHTML = ` `

        // ye loop json m hi chal rahi card bana rahi for every repositories card
        data.forEach(repo => {
            const card = document.createElement('div');
            card.className = 'repo-card';
            card.innerHTML = `
                <h3 class="repo-title" style="color:#310128a8;">${repo.name}</h3> <br>
                <p class="repo-desc">${repo.description || 'No description provided.'}</p>
                <div class="repo-meta">
                    <span>⭐ ${repo.stargazers_count}</span>
                    <span>🍴 ${repo.forks_count}</span>
                    <span>${repo.language}</span>
                </div>
            `;
            //ye mast h ye hard card ko clickable banata h and uss pirticular card ki details show krta h alag alag
            card.addEventListener('click', () => {
                document.querySelector(".repo-in-details").style.display = "flex";
                UI.DetailedRepo(repo);
            })

            this.assivalue.repocards.appendChild(card);
        });
    },

    //card ko click krne mr jo dikh raha h vo ye fnc ki deen h :-))
    DetailedRepo(repoData) {

        this.assivalue.repoindetails.innerHTML = `
            <div class="repo-detail-content">

                <h2 style="color:#310128a8;">${repoData.name}</h2>
                <p><strong>Description:</strong> ${repoData.description || 'No description'}</p>
                <p><strong>Primary Language:</strong> ${repoData.language || 'N/A'}</p>
                <p><strong>Default Branch:</strong> ${repoData.default_branch}</p>
                <p><strong>Created at:</strong> ${new Date(repoData.created_at).toLocaleDateString()}</p>
                <br>
                <span><button class="viewgithub" ><a href="${repoData.html_url}">View on GitHub</a></button></span>
                <span><button id="closebtn" class="closebtn">Close</button></span>
            </div>
        `
        //close button ko active kr raha h to remove that css of card details
        document.getElementById("closebtn").addEventListener('click', () => {
            this.assivalue.repoindetails.style.display = "none";
        })
    }

}




async function main() {

    //local host m save krne ke liye
    UI.assivalue.Searchbtn.addEventListener('click', async () => {
        
        const username = UI.assivalue.usernameinput.value
        //save krdega error se if nothing is entered
        if (!username) {
            alert("Please enter username");
        }
        //ye try catch show kr dega error ko alert m hi 
        try {
            document.querySelector(".profile_info").style.display = "block";
            document.querySelector(".repositories").style.display = "block";
            //excess api1
            const profile = await GitApi.UserProfile(username);
            UI.ProfileData(profile);
            //excess api2 (vese same si hi hain dono 🥲)
            const repodetails = await GitApi.UserRepo(username);
            UI.DisplayCard(repodetails);

            // Save the successfully searched user
            localStorage.setItem("lastGitHubUser", username);
            
        } catch (error) {
            alert(error.message);
        }
    });

    //last search on page load
    const lastSearchedUser = localStorage.getItem("lastGitHubUser");

    //If a saved user exists, put it in the input and click the button automatically
    if (lastSearchedUser) {
        UI.assivalue.usernameinput.value = lastSearchedUser;
        UI.assivalue.Searchbtn.click(); 
    }
}

main();
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
        repoindetails: document.querySelector(".repo-in-details"),
        repoSearch: document.getElementById("repo-search"), 
        repoSort: document.getElementById("repo-sort"),     
        repoControls: document.querySelector(".repo-controls"),
        loader: document.getElementById("loading-screen") 
    },

    //ye function data naam ki json leraha h and profile m details dikha raha
    ProfileData(data) {
        document.querySelector(".profile").innerHTML = `
        <div class="profile">
                <img src="${data.avatar_url}" alt="">
                <div>
                    <h1 style="color:#0d1b14a8;">${data.name}</h1> <br>
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

    //data ki jagah processedRepos array aajayegi every time 
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

const AppState = {
    allRepos: [],

    // ye func search and sort krta hai 
    updateDisplay() {
        // basic initialization kr diya
        const searchTerm = UI.assivalue.repoSearch.value.toLowerCase(); 
        const sortBy = UI.assivalue.repoSort.value;

        //filter ka use kr ke processedRepos ke ander matched hui array aa gayi h
        let processedRepos = this.allRepos.filter(repo =>   //filter formate  => array.filter(fnc)
            repo.name.toLowerCase().includes(searchTerm)    // by using "includes"
        );

        //ab jo new processdrepo h usko sort kr diya h 
        //intrusting way bydefault sort means alphabaticaly means using strings but we want to do on numbers 
        //so we use the a,b concept like 
        //for asending if a-b +ve then a->b     vice-versa
        //for desending if b-a +ve then b->a    vice-versa
        if (sortBy === 'stars') {
            processedRepos.sort((a, b) => b.stargazers_count - a.stargazers_count);
        } else if (sortBy === 'forks') {
            processedRepos.sort((a, b) => b.forks_count - a.forks_count);
        }

        // 4. Send the final processed array to your existing DisplayCard function
        UI.DisplayCard(processedRepos);
    }
}




async function main() {


    // ye har letter ke liye chalta hai in input tag
    UI.assivalue.repoSearch.addEventListener('input', () => {
        AppState.updateDisplay();
    });

    // sorting ke liye
    UI.assivalue.repoSort.addEventListener('change', () => {
        AppState.updateDisplay();
    });


    //local host m save krne ke liye
    UI.assivalue.Searchbtn.addEventListener('click', async () => {
        
        const username = UI.assivalue.usernameinput.value
        //save krdega error se if nothing is entered
        if (!username) {
            alert("Please enter username");
        }
        
        try {
            //loader screen show krega
            UI.assivalue.loader.style.display = "flex"; 
            document.querySelector(".profile_info").style.display = "block";
            document.querySelector(".repositories").style.display = "flex";
            UI.assivalue.repoControls.style.display = "flex"; 

            // Reset inputs nahi searchs ke liye
            UI.assivalue.repoSearch.value = "";
            UI.assivalue.repoSort.value = "default";

            //excess api1
            const profile = await GitApi.UserProfile(username);
            UI.ProfileData(profile);
            //excess api2 (vese same si hi hain dono 🥲)
            const repodetails = await GitApi.UserRepo(username);

            // allrepos array ke ander api json insert kr di aur func call kiya
            AppState.allRepos = repodetails; 
            AppState.updateDisplay();

            // loader ko hide kr dega
            UI.assivalue.loader.style.display = "none"; 
            document.querySelector(".profile_info").style.display = "block";
            document.querySelector(".repositories").style.display = "flex";
            UI.assivalue.repoControls.style.display = "flex"; // Show controls


            // saving last user ek id dekr localstorage main hi setItem ka use krke
            localStorage.setItem("gitkey", username);
            
        } catch (error) {
            // error ane pr repo hide kr dega
            UI.assivalue.loader.style.display = "none";

            alert(error.message);
        }
    });

    //last search ko check kr rahe "getItem" ka use kr ke
    const lastSearchedUser = localStorage.getItem("gitkey");

    //agar last search sucessful hui hogi to input tag m aa jayega aur search ho jayega
    if (lastSearchedUser) {
        UI.assivalue.usernameinput.value = lastSearchedUser;
        UI.assivalue.Searchbtn.click(); 
    }
}

main();
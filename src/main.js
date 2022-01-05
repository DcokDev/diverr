import Web3 from "web3"
import { newKitFromWeb3 } from "@celo/contractkit"
import BigNumber from "bignumber.js"
import marketplaceAbi from "../contract/marketplace.abi.json"
import erc20Abi from "../contract/erc20.abi.json"
import {MPContractAddress, ERC20_DECIMALS, cUSDContractAddress} from "./utils/constants";


let kit
let contract
let posts = []
let messages = []
let user
let hireIndex
let rateIndex
let messageIndex
let stars = 0
const categories = ["Graphics and Design", "Digital Marketing", "Writing and Translation", "Video and Animation", "Music and Audio", "Programming and Tech", "Business", "Lifestyle", "Data"]

const connectCeloWallet = async function () {
  if (window.celo) {
    notification("⚠️ Please approve this DApp to use it.")
    try {
      await window.celo.enable()
      notificationOff()

      const web3 = new Web3(window.celo)
      kit = newKitFromWeb3(web3)

      const accounts = await kit.web3.eth.getAccounts()
      kit.defaultAccount = accounts[0]

      contract = new kit.web3.eth.Contract(marketplaceAbi, MPContractAddress)
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
  } else {
    notification("⚠️ Please install the CeloExtensionWallet.")
  }
}

async function approve(_price) {
  const cUSDContract = new kit.web3.eth.Contract(erc20Abi, cUSDContractAddress)

  return await cUSDContract.methods
    .approve(MPContractAddress, _price)
    .send({ from: kit.defaultAccount })

}

const getBalance = async function () {
  const totalBalance = await kit.getTotalBalance(kit.defaultAccount)
  document.querySelector("#balance").textContent = totalBalance.cUSD.shiftedBy(-ERC20_DECIMALS).toFixed(2)

}

const getUser = async function() {
  const _tmpUser = await contract.methods.getUser(kit.defaultAccount).call()
  user = {
    id: _tmpUser[0],
    name: _tmpUser[1],
    description: _tmpUser[2],
    posts: _tmpUser[3]
  }

  if(user.id !=  kit.defaultAccount){
    document.getElementById("signBtn").style.display = "initial"
    document.getElementById("addSerBtn").style.display = "none"
  }
  else {
    document.getElementById("signBtn").style.display = "none"
    document.getElementById("addSerBtn").style.display = "initial"
  }
}

const getPosts = async function() {
  const _postsLength = await contract.methods.getPostsLength().call()
  const _posts = []
  for (let i = 0; i < _postsLength; i++) {
    let _post = new Promise(async (resolve) => {
      let p = await contract.methods.getPost(i).call()
      let userName = await contract.methods.getUser(p[0]).call()

      resolve({
        index: i,
        author: userName[1],
        creator: p[0],
        title: p[1],
        description: p[2],
        category: p[3],
        stars: p[4],
        buyers: p[5],
        price: new BigNumber(p[6])
      })
    })
    _posts.push(_post)
  }
  posts = await Promise.all(_posts)

  renderPosts()
}

function renderPosts() {
  document.getElementById("marketplace").innerHTML = ""
  posts.forEach((_post) => {
    const newDiv = document.createElement("div")
    newDiv.className = "col-md-4"
    newDiv.innerHTML = productTemplate(_post)
    document.getElementById("marketplace").appendChild(newDiv)
  })
}

function productTemplate(_post) {
  const _tmp = _post.stars.reduce((a,b) => parseInt(a) + parseInt(b), 0) / _post.stars.length;
  const _stars = !isNaN(_tmp) ? _tmp : 0;
  const buttonShow = _post.buyers.includes(kit.defaultAccount) && _post.creator != kit.defaultAccount ? `<button class="btn btn-secondary btn-sm reviewService" data-bs-toggle="modal" data-bs-target="#rateService" id="${_post.index}">Review</button>` : ""
  const hireButton = _post.creator != kit.defaultAccount ? `<button class="btn btn-dark btn-sm hireService" data-bs-toggle="modal" data-bs-target="#hireModal" id="${_post.index}">Hire for ${_post.price.shiftedBy(-ERC20_DECIMALS).toFixed(2)} cUSD</button>`: `<button class="btn btn-dark btn-sm viewMessages" data-bs-toggle="modal" data-bs-target="#messagesModal" id="${_post.index}">Messages</button>`
  return `
  <div class="card mb-4">
    <div class="card-body">
        <h4 class="card-title"><a style="cursor: pointer;">${_post.title}</a></h4>
        <a style="cursor: pointer;"><i class="fa fa-folder-open-o"></i>${categories[_post.category]}</a> by ${_post.author}
        <p class="card-text">${_post.description}</p>
        <div class="rating" style="cursor: pointer;">
          <span class="rating__result">${_stars.toFixed(2)}</span> 
          ${starsRender(_stars.toFixed(2))}
          <button class="btn btn-outline-secondary btn-sm viewReviews" data-bs-toggle="modal" data-bs-target="#viewModal" id="${_post.index}">Reviews</button>
          ${buttonShow}
          ${hireButton}
        </div>
    </div>
  </div>
  `
}

function starsRender(_stars = 0) {
  let newEle = ""
  for(let i = 0; i < 5; i++){
    if (i < Math.round(_stars)) {
      newEle += `<i class="rating__star fas fa-star"></i>`
    }
    else {
      newEle += `<i class="rating__star far fa-star"></i>`
    }
  }
  return newEle
}

// function identiconTemplate(_address) {
//   const icon = blockies
//     .create({
//       seed: _address,
//       size: 8,
//       scale: 16,
//     })
//     .toDataURL()

  return `
  <div class="rounded-circle overflow-hidden d-inline-block border border-white border-2 shadow-sm m-0">
    <a href="https://alfajores-blockscout.celo-testnet.org/address/${_address}/transactions"
        target="_blank">
        <img src="${icon}" width="48" alt="${_address}">
    </a>
  </div>
  `
}



function notification(_text) {
  document.querySelector(".alert").style.display = "block"
  document.querySelector("#notification").textContent = _text
}

function notificationOff() {
  document.querySelector(".alert").style.display = "none"
}

window.addEventListener("load", async () => {
  notification("⌛ Loading...")
  await connectCeloWallet()
  await getBalance()
  await getPosts()
  await getUser()
  notificationOff()
});

document
  .querySelector("#newPostBtn")
  .addEventListener("click", async () => {
    const params = [
      document.getElementById("newPostTitle").value,
      document.getElementById("newDescription").value,
      document.getElementById("newCategory").value,
      new BigNumber(document.getElementById("newPrice").value)
      .shiftedBy(ERC20_DECIMALS)
      .toString()
    ]
    notification(`⌛ Adding "${params[0]}"...`)
    try {
    await contract.methods
        .postService(...params)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully added "${params[0]}".`)
    getPosts()
  })

document.getElementById("registerUser").addEventListener("click", async () => {
  const userName = document.getElementById("newUserName").value
  notification(`⌛ Registering as "${userName}"...`)
    try {
      await contract.methods
        .registerUser(userName)
        .send({ from: kit.defaultAccount })
    } catch (error) {
      notification(`⚠️ ${error}.`)
    }
    notification(`🎉 You successfully registered as "${userName}".`)
    getUser()
})

document.querySelector("#marketplace").addEventListener("click", async (e) => {
  if (e.target.className.includes("hireService")) {
    hireIndex = e.target.id
  }
  if (e.target.className.includes("reviewService")) {
    rateIndex = e.target.id
  }
  if(e.target.className.includes("viewReviews")) {
    const reviews = posts[e.target.id].stars

    const _tmp = posts[e.target.id].stars.reduce((a,b) => parseInt(a) + parseInt(b), 0) /  posts[e.target.id].stars.length;
    const _stars = !isNaN(_tmp) ? _tmp : 0;

    document.getElementById("reviewsView").innerHTML = `<h3>${_stars.toFixed(2)} / 5</h3>`
    document.getElementById("reviewsView").innerHTML += starsRender(_stars)

    document.createElement("ul")

    for (let i of reviews) {
      const listItem = document.createElement("li")
      listItem.style.listStyleType = "none"
      listItem.innerHTML = i + " / 5"
      document.getElementById("reviewsView").appendChild(listItem)
    }
  }
  if(e.target.className.includes("viewMessages")) {
    messageIndex = e.target.id

    const messagesArr = await contract.methods.getMessages(messageIndex).call()

    const _messages = []
    for (let i = 0; i < messagesArr.length; i++) {
      let _message = new Promise(async (resolve) => {
        let m = await contract.methods.getMessage(i).call()
        resolve({
          index: i,
          sender: m[0],
          content: m[1],
          contact: m[2],
          postId: m[3],
        })
      })
      _messages.push(_message)
    }
    messages = await Promise.all(_messages)



    document.getElementById("messagesView").innerHTML = ""

    messages.forEach(_message => {
      document.getElementById("messagesView").innerHTML += messageTemplate(_message);
    })
  }
})

function messageTemplate(_message) {
  return `
  <li class="list-group-item">
  <div style="text-align: center;">
    <p class="text-break" style="font-weight: bold;">From: ${_message.sender}</p>
    <p>Content: ${_message.content}</p>
    <p>Contact to: ${_message.contact}</p>
  </div>
  </li>
  `
}

const ratingStars = [...document.getElementsByClassName("rating__star")];
const ratingResult = document.querySelector(".rating__result");

printRatingResult(ratingResult);

function executeRating(stars, result) {
   const starClassActive = "rating__star fas fa-star";
   const starClassUnactive = "rating__star far fa-star";
   const starsLength = stars.length;
   let i;
   stars.map((star) => {
      star.onclick = () => {
         i = stars.indexOf(star);

         if (star.className.indexOf(starClassUnactive) !== -1) {
            printRatingResult(result, i + 1);
            for (i; i >= 0; --i) stars[i].className = starClassActive;
         } else {
            printRatingResult(result, i+1);
            for (i; i < starsLength; ++i) stars[i+1].className = starClassUnactive;
         }
      };
   });
}

function printRatingResult(result, num = 0) {
   result.textContent = `${num}/5`;
   stars = num
}

executeRating(ratingStars, ratingResult);


document.getElementById("hireServiceBtn").addEventListener("click", async () => {
  const message = document.getElementById("newHireMessage").value
  const contact = document.getElementById("newHireContact").value
  notification("⌛ Waiting for payment approval...")
  try {
    await approve(posts[hireIndex].price)
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
  notification(`⌛ Awaiting payment for "${posts[hireIndex].title}"...`)
  try {
    await contract.methods
      .hireService(hireIndex, message, contact)
      .send({ from: kit.defaultAccount })
    notification(`🎉 You successfully hired "${posts[hireIndex].author}".`)
    getPosts()
    getBalance()
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})

document.querySelector("#filterCategory").addEventListener("change", async (e)=> {
  await getPosts()
  if(e.target.value != "All Categories"){
    posts = posts.filter((post) => {
      return post.category == e.target.value
    })
  }
  await renderPosts()
})

document.getElementById("rateServiceBtn").addEventListener("click", async () => {
  notification("⌛ Sending review...")
  try {
    await contract.methods
      .reviewService(rateIndex, stars)
      .send({ from: kit.defaultAccount })
    notification(`🎉 You successfully reviewed "${posts[rateIndex].title}".`)
    getPosts()
    getBalance()
  } catch (error) {
    notification(`⚠️ ${error}.`)
  }
})
// The time for thinking is now!
// Basically, for any child comment, we want to add a button to only show the conversation between that element and their parent element
// We need:
// * a selector for all child posts with children of their own elements
// * some utility selector's for the Hacker News post
//  * a selector for the "reply" area for each matching element
//  * a selector for the username of a post
//  * a select for the parent post of the elemnt
//  * A selector for an HN post
// * A selector that excludes all HN posts that don't match the user id of the child, parent

const topLevelIndent = 0 // things without any parents have this indent
const indentIncrement = 40 // The amount HN increments each new inheritance level
const hnPostSelector = ".athing"
const commentAuthorSelector = ".comhead > a" // And then grab text content
const replyAreaSelector = ".reply > p"
const indentSelector = ".ind > img"
const parentPost = "" // The most recent ".athing" where the ind img is 40 pixels less
const commentsSelector = ".comment-tree tr.athing"

function getIndent(postElement) {
  return postElement.querySelector(indentSelector).width
}

function hasParent(postElement) {
  return getIndent(postElement) !== topLevelIndent
}

function getParentPost(postElement) {
  if (!hasParent(postElement)) {
    return null
  }

  let postElementOffset = postElement.querySelector(indentSelector).width
  let possibleParent = postElement.previousElementSibling
  while (
    possibleParent &&
    getIndent(possibleParent) !== postElementOffset - indentIncrement
  ) {
    possibleParent = possibleParent.previousElementSibling
  }
  return possibleParent
}

function getDirectChildrenPosts(postElement) {
  let postElementOffset = getIndent(postElement)
  let children = []
  let possibleChild = postElement.nextElementSibling
  while (
      possibleChild
      && getIndent(possibleChild) > postElementOffset
    ) {
    if (getIndent(possibleChild) === postElementOffset + indentIncrement) {
      children.push(possibleChild)
    }
    possibleChild = possibleChild.nextElementSibling
  }
  return children
}

function getChildrenPosts(postElement) {
  let postElementOffset = getIndent(postElement)
  let children = []
  let possibleChild = postElement.nextElementSibling
  while (
      possibleChild
      && getIndent(possibleChild) > postElementOffset
    ) {
    children.push(possibleChild)
    possibleChild = possibleChild.nextElementSibling
  }
  return children
}

function getAuthor(commentElement) {
  return commentElement.querySelector(commentAuthorSelector).textContent
}

function handleShowallClick(event) {
  event.preventDefault()
  let children = getChildrenPosts(this)
  for(let i = 0; i < children.length; i++) {
    children[i].hidden = false
  }
  this.querySelectorAll(replyAreaSelector + " font")[1].hidden = false
  this.querySelectorAll(replyAreaSelector + " font")[2].hidden = true
}

function handleConversationClick(event) {
  event.preventDefault()
  let children = getChildrenPosts(this)
  let parent = getParentPost(this)
  if (!parent || !children) {
    return
  }

  let allowedAuthors = [getAuthor(this), getAuthor(parent)]
  for(let i = 0; i < children.length; i++) {
    let child = children[i]
    if (allowedAuthors.indexOf(getAuthor(child)) === -1) {
      child.hidden = true
    }
  }

  this.querySelectorAll(replyAreaSelector + " font")[1].hidden = true
  this.querySelectorAll(replyAreaSelector + " font")[2].hidden = false
}

function main() {
  let commentElements = document.querySelectorAll(commentsSelector)
  let conversationLinkTemplate = document.createElement("font")
  conversationLinkTemplate.size = 1
  let showallLinkTemplate = conversationLinkTemplate.cloneNode(true)
  showallLinkTemplate.hidden = true
  conversationLinkTemplate.innerHTML = '<u><a href="#" class="js-conversation-link">conversation</a></u>'
  showallLinkTemplate.innerHTML = '<u><a href="#" class="js-conversation-link">showall</a></u>'
  for (let i = 0; i < commentElements.length; i++) {
    let el = commentElements[i]
    let directChildren = getDirectChildrenPosts(el)
    for (let j = 0; j < directChildren.length; j++) {
      let directChild = directChildren[j]
      let conversationLink = conversationLinkTemplate.cloneNode(true)
      // Handle click and bind to event
      conversationLink.addEventListener(
          "click",
          handleConversationClick.bind(directChild),
          false
      )
      let showallLink = showallLinkTemplate.cloneNode(true)
      // Handle click and bind to event
      showallLink.addEventListener(
          "click",
          handleShowallClick.bind(directChild),
          false
      )
      directChild.querySelector(replyAreaSelector).appendChild(conversationLink)
      directChild.querySelector(replyAreaSelector).appendChild(showallLink)
    }
  }
}

main()

class CreditsComponent extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        // Styles
        const style = document.createElement('style')
        style.textContent = `
      .Credits {
        min-height: 10vh;
        box-shadow: 10px 10px 30px black;
        background-color: white;
        border-radius: 50px;
        display: flex;
        align-items: center;
        padding: 0 20px;
        justify-content: space-between;
        margin: 2rem 4rem;
      }
      .links {
        display: flex;
      }
      .links > a {
        text-decoration: none;
        color: black;
        font-size: 20px;
        margin: 0 4.5px;
      }
    `

        // HTML Template
        const container = document.createElement('div')
        container.classList.add('Credits')
        container.innerHTML = `
      <h1>Made by GrowWithTalha 💜</h1>
      <div class="links">
        <a href="https://growwithtalha.vercel.app/">Portfolio</a>
        <a href="https://github.com/GrowWidTalha">Github</a>
        <a href="https://www.linkedin.com/in/growwithtalha-webdeveloper">Linkedin</a>
        <a href="https://twitter.com/GrowWithTalha">Twitter</a>
        <a href="mailto:growwithtalha@outlook.com">Contact</a>
      </div>
    `

        // Append styles and container to the shadow DOM
        this.shadowRoot?.append(style, container)
    }

    connectedCallback() {
        const credits = this.getAttribute('credits') || ''
        const creditsArray = credits.split(',')
        const creditsList = this.shadowRoot?.querySelector('.Credits .links')

        creditsArray.forEach((credit) => {
            const listItem = document.createElement('a')
            listItem.href = '#'
            listItem.textContent = credit.trim()
            creditsList?.appendChild(listItem)
        })
    }
}

customElements.define('credits-component', CreditsComponent)

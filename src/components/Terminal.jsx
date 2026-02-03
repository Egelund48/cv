import { useEffect, useRef } from "react"
import { Terminal as XTerminal } from "xterm"
import { FitAddon } from "xterm-addon-fit"
import "xterm/css/xterm.css"

export default function Terminal() {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const fitRef = useRef(null)
  const currentPath = useRef("Christian_Egelund_Hansen/.../cv") // fake folder path

  useEffect(() => {
    if (termRef.current) return

    // Initialize terminal
    const term = new XTerminal({
      cursorBlink: true,
      fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
      fontSize: 16,
      theme: {
        background: "#000000",
        foreground: "#00ff88"
      }
    })
    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)
    fitAddon.fit()

    termRef.current = term
    fitRef.current = fitAddon

    const resize = () => fitAddon.fit()
    window.addEventListener("resize", resize)

  const welcome = `
  _    _        _                                 _                                               _           _  _                      
 | |  | |      | |                               | |                                             | |         (_)| |                     
 | |  | |  ___ | |  ___   ___   _ __ ___    ___  | |_   ___    _ __ ___   _   _  __      __  ___ | |__   ___  _ | |_   ___              
 | |/\\| | / _ \\| | / __| / _ \\ | '_ \` _ \\  / _ \\ | __| / _ \\  | '_ \` _ \\ | | | | \\ \\ /\\ / / / _ \\| '_ \\ / __|| || __| / _ \\             
 \\  /\\  /|  __/| || (__ | (_) || | | | | ||  __/ | |_ | (_) | | | | | | || |_| |  \\ V  V / |  __/| |_) |\\__ \\| || |_ |  __/ _           
  \\/  \\/  \\___||_| \\___| \\___/ |_| |_| |_| \\___|  \\__| \\___/  |_| |_| |_| \\__, |   \\_/\\_/   \\___||_.__/ |___/|_| \\__| \\___|( )          
                                                                          __/ |                                           |/           
                                                                         |___/                                                    
                                                                         
Type 'help' to see the list of available commands
`

    // Animate banner line by line
    const lines = welcome.split("\n")
    let i = 0

    function writeLine() {
      if (i >= lines.length) {
        writePrompt() // start prompt after animation
        return
      }
      term.writeln(lines[i])
      i++
      setTimeout(writeLine, 80) // 80ms delay per line
    }
    writeLine()

    // Input handling
    let input = ""

    function writePrompt() {
      term.write(`${currentPath.current}$ `)
    }

    term.onKey(({ key, domEvent }) => {
      const code = domEvent.key

      if (code === "Enter") {
        term.write("\r\n")
        const shouldWaitForPrompt = handleCommand(term, input.trim())
        input = ""
        if (!shouldWaitForPrompt) {
          writePrompt()
        }
      } else if (code === "Backspace") {
        if (input.length > 0) {
          input = input.slice(0, -1)
          term.write("\b \b")
        }
      } else if (code === "Tab"){
        domEvent.preventDefault() // Prevent default tab behavior
        
        const result = autocomplete(input)
        
        if (result.completed) {
          // Clear current input
          for (let i = 0; i < input.length; i++) {
            term.write("\b \b")
          }
          input = result.completed
          term.write(result.completed)
        } else if (result.matches && result.matches.length > 1) {
          // Show all matches
          term.write("\r\n")
          term.writeln(result.matches.join("  "))
          writePrompt()
          term.write(input)
        }
      } else if (!domEvent.ctrlKey && !domEvent.metaKey && code.length === 1) {
        input += key
        term.write(key)
      } else if ((domEvent.ctrlKey || domEvent.metaKey) && code === "k") {
          // Ctrl+K or Cmd+K to clear terminal
          domEvent.preventDefault()
          term.clear()
          input = ""
      }
    })

    // Cleanup
    return () => {
      window.removeEventListener("resize", resize)
      term.dispose()
      termRef.current = null
    }
  }, [])

  return (
    <div
      style={{
        height: "98vh",
        width: "98vw",
        padding: "10px",
        boxSizing: "border-box",
        border: "3px solid #00ff00",
        borderRadius: "6px",
        backgroundColor: "black",
        boxShadow: "0 0 10px #00ff00",
        textAlign: "left",
        overflowX: "auto"
      }}
    >
      <div ref={containerRef} style={{ height: "100%", width: "100%" }} />
    </div>
  )
}

// --- Auto complete function ---
// --- Autocomplete function ---
function autocomplete(input) {
  const commands = ["help", "whoami", "ls", "cat", "cd", "about", "banner", "clear", "linkedin", "gitlab", "github"]
  const files = ["AboutMe.txt", "MyCV.txt", "projects/"]
  
  const parts = input.split(" ")
  const isFirstWord = parts.length === 1
  
  if (isFirstWord) {
    const matches = commands.filter(cmd => cmd.startsWith(input))
    if (matches.length === 1) {
      return { completed: matches[0], matches: null }
    } else if (matches.length > 1) {
      return { completed: null, matches }
    }
  } else {
    const lastWord = parts[parts.length - 1]
    const matches = files.filter(file => file.startsWith(lastWord))
    
    if (matches.length === 1) {
      parts[parts.length - 1] = matches[0]
      return { completed: parts.join(" "), matches: null }
    } else if (matches.length > 1) {
      return { completed: null, matches }
    }
  }
  
  return { completed: null, matches: null }
}

// --- Command handling ---
function handleCommand(term, input) {
  if (!input) return
  const [cmd, ...args] = input.split(" ")
  const currentPath = "Christian_Egelund_Hansen/.../cv"
  const welcome = `
  
  _    _        _                                 _                                               _           _  _                      
 | |  | |      | |                               | |                                             | |         (_)| |                     
 | |  | |  ___ | |  ___   ___   _ __ ___    ___  | |_   ___    _ __ ___   _   _  __      __  ___ | |__   ___  _ | |_   ___              
 | |/\\| | / _ \\| | / __| / _ \\ | '_ \` _ \\  / _ \\ | __| / _ \\  | '_ \` _ \\ | | | | \\ \\ /\\ / / / _ \\| '_ \\ / __|| || __| / _ \\             
 \\  /\\  /|  __/| || (__ | (_) || | | | | ||  __/ | |_ | (_) | | | | | | || |_| |  \\ V  V / |  __/| |_) |\\__ \\| || |_ |  __/ _           
  \\/  \\/  \\___||_| \\___| \\___/ |_| |_| |_| \\___|  \\__| \\___/  |_| |_| |_| \\__, |   \\_/\\_/   \\___||_.__/ |___/|_| \\__| \\___|( )          
                                                                          __/ |                                           |/           
                                                                         |___/                                                    
                                                                         
Type 'help' to see the list of available commands
`

  switch (cmd) {
    case "help":
        term.writeln("Welcome to my website!\n")
        term.writeln("Here are all the available commands:\n")
        term.writeln("whoami, ls, cat, cd, help, about, banner, linkedin,")
        term.writeln("github, gitlab")
        break
    case "whoami":
        term.writeln("Hello!\n")
        term.writeln("I am Christian Egelund Hansen - Computer scientist studying at Syddansk Universitet\n")
        break
    case "ls":
        term.writeln("MyCV.txt     AboutMe.txt   projects/")
        break
    case "cat":
        if (args[0] === "AboutMe.txt") {
        term.writeln(
            "Bla. Bla. Bla fill in"
        )
        } else if (args[0] === "MyCV.txt"){
            term.writeln("Here is my CV. Test, test, test, last test")
        } else {
        term.writeln("cat: file not found")
        }
        break

    case "cd":
        term.writeln("cd command simulated")
        break
    
    case "banner": 
        const bannerLines = welcome.split("\n")
        bannerLines.forEach(line => {
            term.writeln(line)
        })
        break

    case "linkedin": 
      term.write("Deploying my LinkedIn profile")
      let dots = 0
      const loadingInterval = setInterval(() => {
          term.write(".")
          dots++
          if (dots === 6) {
              clearInterval(loadingInterval)
              term.writeln("")
              window.open("https://www.linkedin.com/in/christian-egelund-hansen-94586a298/", "_blank")
              // Write prompt after opening link
              term.write(`${currentPath}$ `)
          }
      }, 800)
      return true // Signal to not write prompt immediately

    case "gitlab": 
      term.write("Deploying my GitLab profile")
      let gitlabDots = 0
      const gitlabLoadingInterval = setInterval(() => {
          term.write(".")
          gitlabDots++
          if (gitlabDots === 6) {
              clearInterval(gitlabLoadingInterval)
              term.writeln("")
              window.open("https://gitlab.sdu.dk/chhan24", "_blank")
              term.write(`${currentPath}$ `)
          }
      }, 800)
      return true
    default:
        term.writeln(`command not found: ${cmd}`)
  }
}

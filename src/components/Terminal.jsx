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
        handleCommand(term, input.trim())
        input = ""
        writePrompt()
      } else if (code === "Backspace") {
        if (input.length > 0) {
          input = input.slice(0, -1)
          term.write("\b \b")
        }
      } else if (!domEvent.ctrlKey && !domEvent.metaKey && code.length === 1) {
        input += key
        term.write(key)
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

// --- Command handling ---
function handleCommand(term, input) {
  if (!input) return
  const [cmd, ...args] = input.split(" ")
  const currentPath = "Christian_Egelund_Hansen/.../cv"

  switch (cmd) {
    case "help":
        
        term.writeln("Available commands: whoami, ls, cat, cd, help")
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
            term.writeln("Here is my CV. Test")
        } else {
        term.writeln("cat: file not found")
        }
        break

    case "cd":
        term.writeln("cd command simulated")
        break
    default:
        term.writeln(`command not found: ${cmd}`)
  }
}

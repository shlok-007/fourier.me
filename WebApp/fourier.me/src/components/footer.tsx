import { GitHubLogoIcon } from "@radix-ui/react-icons"

export default function Footer(){
    return (
        <footer className="w-full h-20 mt-20 flex items-center justify-between text-muted-foreground border-t border-gray">
            <div className="ml-5">
                <p>Developed by Shlok</p>
            </div>
            <div className="mr-5 flex items-center">
                <a href="https://www.github.com/shlok-007/fourier.me" target="_blank" rel="noopener noreferrer" className="flex items-center">
                    <GitHubLogoIcon className="w-6 h-6 text-white mr-3"/>
                    <p>shlok-007</p>
                </a>
            </div>
        </footer>
    )
}
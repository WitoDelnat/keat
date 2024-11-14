import './App.css'
import { createKeat } from 'keat-react'
import { useCallback, useState } from 'react'
import cohorts from './keat.json?cohorts'

type Token = typeof EXAMPLE_ID_TOKEN

declare module 'keat' {
    interface CustomTypes {
        user: Token
    }
}

const { FeatureBoundary, useKeat } = createKeat({
    features: {
        demo: true,
        chatbot: false,
    },
    cohorts: {
        foo: ['wito@kubeshop.io'],
        ...cohorts,
    },
    fetch: 'http://localhost:8787/18f9069bb2ee470eb75ef1da3db698ee/feature-flags.json',
})

const EXAMPLE_ID_TOKEN = {
    iss: 'http://auth.example.com',
    sub: '123456',
    aud: 'demo-client',
    exp: 1311281970,
    iat: 1311280970,
    email: 'john@example.com',
}

const GMAIL_ID_TOKEN: Token = {
    iss: 'http://auth.example.com',
    sub: 'g_23456',
    aud: 'demo-client',
    exp: 1311281970,
    iat: 1311280970,
    email: 'jane@gmail.com',
}

function App() {
    const { identify: identifyKeat } = useKeat()
    const [token, setToken] = useState<Token>()

    const identify = useCallback(
        (tkn: Token | undefined) => {
            setToken(tkn)
            identifyKeat(tkn)
        },
        [identifyKeat]
    )

    const toggleKeatMenu = useCallback(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const d = document.getElementsByTagName('keat-menu')[0] as any
        d?.showModal()
    }, [])

    return (
        <>
            <h1>Keat + Vite + React</h1>

            <div className="card">
                <FeatureBoundary
                    name="demo"
                    display="optional"
                    fallback={<p>Demo disabled</p>}
                >
                    <p>Demo enabled</p>
                </FeatureBoundary>

                <p className="description">
                    In this basic example, users from example.com have Demo
                    enabled while others do not.
                </p>

                <div className="actions">
                    <button
                        onClick={() => {
                            identify(EXAMPLE_ID_TOKEN)
                        }}
                    >
                        Login as john@example.com
                    </button>

                    <button
                        onClick={() => {
                            identify(GMAIL_ID_TOKEN)
                        }}
                    >
                        Login as jane@gmail.com
                    </button>

                    <button
                        onClick={() => {
                            identify(undefined)
                        }}
                    >
                        Logout
                    </button>

                    <button onClick={toggleKeatMenu}>open keat menu</button>
                </div>

                <p className="description">
                    You are currently{' '}
                    {!token ? 'unauthenticated' : `logged in as ${token.email}`}
                    .
                </p>
            </div>
        </>
    )
}

export default App

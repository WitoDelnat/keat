import './App.css'
import 'keat-release/style.css'
import { createKeat } from 'keat-react'
import { useCallback, useState } from 'react'
import { KeatMenu } from 'keat-release'

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
    audiences: {
        staff: ['john@example.com'],
        foo: 1,
        bar: 10,
    },
    fetch: 'app-id',
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

    return (
        <>
            <h1>Keat + Vite + React</h1>
            <KeatMenu />

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

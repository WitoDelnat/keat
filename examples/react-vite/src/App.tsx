import './App.css'
import { keat } from 'keat-react'
import { audience } from 'keat'
import { useCallback, useState } from 'react'

const { FeatureBoundary, useKeat } = keat({
    features: {
        demo: 'staff',
    },
    plugins: [
        audience('staff', (u) => u.email.endsWith('@example.com'))
    ],
})

type Token = typeof EXAMPLE_ID_TOKEN

const EXAMPLE_ID_TOKEN = {
    iss: 'http://auth.example.com',
    sub: '123456',
    aud: 'demo-client',
    exp: 1311281970,
    iat: 1311280970,
    email: 'jane@example.com',
}

const GMAIL_ID_TOKEN: Token = {
    iss: 'http://auth.example.com',
    sub: 'g_23456',
    aud: 'demo-client',
    exp: 1311281970,
    iat: 1311280970,
    email: 'john@gmail.com',
}

function App() {
    const { setUser } = useKeat()
    const [token, setToken] = useState<Token>()

    const identify = useCallback(
        (tkn: Token | undefined) => {
            setToken(tkn)
            setUser(tkn)
        },
        [setUser]
    )

    return (
        <>
            <h1>Keat + Vite + React</h1>

            <div className="card">
                <FeatureBoundary name="demo" display="optional" fallback={<p>Demo disabled</p>}>
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
                        Login as jane@example.com
                    </button>

                    <button
                        onClick={() => {
                            identify(GMAIL_ID_TOKEN)
                        }}
                    >
                        Login as john@gmail.com
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

import prompts from 'prompts'

export const noInstanceFound = () => `
No keat instance found.

`

export const manyInstancesFound = () => `
Found multiple Keat instances.
`

export async function promptImport(files: string[]): Promise<string> {
    const { result } = await prompts({
        type: 'select',
        name: 'result',
        message: 'Select Keat instance to import',
        choices: files.map((file) => ({ title: file, value: file })),
        instructions: false,
        hint: ' ',
    })

    return result
}

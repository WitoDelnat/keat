import { Change, diffLines } from 'diff'
import { readFile } from 'fs/promises'
import { IndentationText, Project, SourceFile } from 'ts-morph'
import { confirm } from './confirm.cjs'
import { B, C, print } from './screens.cjs'

type ModifyCodeOptions = {
    /**
     * Skips confirmation of the code modifications.
     */
    skipConfirm?: boolean

    /**
     * The lines to show.
     *
     * @remark use -1 to show the whole file.
     * @default 2
     */
    beforeAfterLineCount?: number
}

export async function modifyCode(
    path: string,
    { skipConfirm, beforeAfterLineCount }: ModifyCodeOptions,
    cb: (code: SourceFile) => void
) {
    const project = new Project({
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            useTrailingCommas: true,
        },
    })

    const sourceFile = await readFile(path, 'utf8')
    const code = project.createSourceFile(path, sourceFile, {
        overwrite: true,
    })

    cb(code)

    if (!skipConfirm) {
        const original = sourceFile
        const modified = code.getText()

        const difference = diffLines(original, modified)
        const shortDifference = shorten(difference, beforeAfterLineCount)

        const colored = shortDifference
            .map((part) => {
                return part.added
                    ? C.green(part.value)
                    : part.removed
                    ? C.red(part.value)
                    : part.divider
                    ? C.cyan(part.value)
                    : part.value
            })
            .join('')

        print(modifyPreview(path, colored))

        await confirm({
            message: 'Continue?',
            cancel: 'Your file has not been updated.',
        })
    } else {
        print(modifyAcknowledge(path))
    }

    await code.save()
}

export const modifyPreview = (path: string, content: string) => `
${C.magenta('Keat will make the following changes to your file:')}

${B(content, {
    title: path,
    padding: { left: 1, right: 3, bottom: 0, top: 0 },
})}
`

export const modifyAcknowledge = (path: string) =>
    `${C.magenta(`Keat made changes to ${path}.`)}`

type ChangeWithDiv = Change & { divider?: boolean }

function shorten(
    changes: Change[],
    beforeAfterLineCount: number = 2
): ChangeWithDiv[] {
    if (beforeAfterLineCount === -1) {
        return changes
    }

    let lineCount = 0
    const newChanges = changes.flatMap(
        (change, index): ChangeWithDiv | ChangeWithDiv[] => {
            const isFirst = index === 0
            const isLast = index === changes.length - 1

            if (!change.count) {
                return change
            }

            if (change.added) {
                lineCount += change.count
                return change
            }

            if (change.removed) {
                lineCount -= change.count
                return change
            }

            if (
                change.count <
                (isFirst ? beforeAfterLineCount : 0) +
                    (isLast ? beforeAfterLineCount : 0) +
                    1
            ) {
                return change
            }

            const lines = change.value.split('\n')
            const post: string[] = []
            let divider: string = ''
            const pre: string[] = []

            if (!isFirst) {
                post.push(...lines.slice(0, beforeAfterLineCount))
            }

            if (!isLast) {
                pre.push(...lines.slice(-(beforeAfterLineCount + 1)))
                lineCount += change.count - beforeAfterLineCount
                divider = `\n@@ ~L${lineCount + 1} @@\n`
            }

            return [
                {
                    value: post.join('\n'),
                    count: post.length,
                },
                {
                    value: divider,
                    divider: true,
                    count: divider === '' ? 0 : 1,
                },
                {
                    value: pre.join('\n'),
                    count: pre.length,
                },
            ]
        }
    )

    if (newChanges[0].removed || newChanges[0].added) {
        newChanges.splice(0, 0, {
            value: '@@ ~L0 @@\n',
            count: 1,
            divider: true,
        })
    }

    return newChanges
}

export async function readCode<T>(
    path: string,
    cb: (code: SourceFile) => T | Promise<T>
): Promise<T> {
    const project = new Project({
        manipulationSettings: {
            indentationText: IndentationText.TwoSpaces,
            useTrailingCommas: true,
        },
    })

    const sourceFile = await readFile(path, 'utf8')
    const code = project.createSourceFile(path, sourceFile, {
        overwrite: true,
    })

    return cb(code)
}

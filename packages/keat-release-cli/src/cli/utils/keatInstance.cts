import { SourceFile, SyntaxKind } from 'ts-morph'
import { isDefined } from './basics.cjs'
import { readCode } from './modifyCode.cjs'
import { getId, Kind } from './ts-morph.cjs'

export type Instance = {
    app?: string
    audiences?: string[]
    features?: string[]
}

export function extractInstance(path?: string): Promise<Instance | undefined> {
    if (!path) {
        return Promise.resolve(undefined)
    }

    return readCode(path, async (code) => {
        const features = extractFeatures(code)
        const audiences = extractAudiences(code)
        const app = extractAppId(code)

        return { features, audiences, app }
    })
}

export function extractFeatures(code: SourceFile): string[] | [] {
    const callExpressions = code.getDescendantsOfKind(SyntaxKind.CallExpression)

    const keatCall = callExpressions.find((call) => {
        const name = getId(call) ?? ''
        return ['keat'].includes(name)
    })

    if (!keatCall) {
        return []
    }

    const args = keatCall.getFirstChildByKindOrThrow(
        SyntaxKind.ObjectLiteralExpression
    )

    const featuresNode = args
        .getProperties()
        .find((property) => getId(property) === 'features')

    if (!featuresNode) {
        return []
    }

    const featureRecord = featuresNode.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression
    )

    if (!featureRecord) {
        return []
    }

    const features = featureRecord
        .getProperties()
        .map((property) => {
            // case 1: { search: true }
            // case 2: const search = true; { seach }
            const id = getId(property)
            if (id) return id

            // case 3: { "some-search": true }
            const key = property.getFirstChild()
            const feature = key?.asKind(Kind.StringLiteral)?.getLiteralValue()
            if (feature) return feature

            // unknown
            return undefined
        })
        .filter(isDefined)

    return features
}

function extractAppId(code: SourceFile): string | undefined {
    const callExpressions = code.getDescendantsOfKind(SyntaxKind.CallExpression)

    const keatCall = callExpressions.find((call) => {
        const name = getId(call) ?? ''
        return ['keat'].includes(name)
    })

    if (!keatCall) {
        return undefined
    }

    return keatCall
        .getArguments()
        .at(0)
        ?.asKind(Kind.StringLiteral)
        ?.getLiteralValue()
}

function extractAudiences(code: SourceFile): string[] {
    const callExpressions = code.getDescendantsOfKind(SyntaxKind.CallExpression)

    const keatCall = callExpressions.find((call) => {
        const name = getId(call) ?? ''
        return ['keat'].includes(name)
    })

    if (!keatCall) {
        return []
    }

    const args = keatCall.getFirstChildByKindOrThrow(
        SyntaxKind.ObjectLiteralExpression
    )

    const audiencesNode = args
        .getProperties()
        .find((property) => getId(property) === 'audiences')

    if (!audiencesNode) {
        return []
    }

    const audiencesRecord = audiencesNode.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression
    )

    if (!audiencesRecord) {
        return []
    }

    const audiences = audiencesRecord
        .getProperties()
        .map((property) => {
            // case 1: { search: true }
            // case 2: const search = true; { seach }
            const id = getId(property)
            if (id) return id

            // case 3: { "some-search": true }
            const key = property.getFirstChild()
            const feature = key?.asKind(Kind.StringLiteral)?.getLiteralValue()
            if (feature) return feature

            // unknown
            return undefined
        })
        .filter(isDefined)

    return audiences
}

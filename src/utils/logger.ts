import chalk from 'chalk'
import { ErrorPhase, ErrorSeverity } from '../types/Errors'
import { EntityNames } from '../types/EntityNames'
import { DirectionalAdverbs } from '../types/words/DirectionalAdverbs'

const entityNameValues = new RegExp(
  `${Object.values(EntityNames)
    .map((name) => `\\b${name}\\b`)
    .join('(?:s)?|')}`,
  'g'
)

const directionValues = new RegExp(
  `${Object.values(DirectionalAdverbs)
    .map((name) => `\\b${name}\\b`)
    .join('(?:s)?|')}`,
  'g'
)

const directionText = {
  [DirectionalAdverbs.N]: chalk.yellowBright`N ${chalk.bold('↑')}`,
  [DirectionalAdverbs.S]: chalk.yellowBright`S ${chalk.bold('↓')}`,
  [DirectionalAdverbs.E]: chalk.yellowBright`E ${chalk.bold('→')}`,
  [DirectionalAdverbs.W]: chalk.yellowBright`W ${chalk.bold('←')}`,
  [DirectionalAdverbs.NE]: chalk.yellowBright`NE ${chalk.bold('↗')}`,
  [DirectionalAdverbs.NW]: chalk.yellowBright`NW ${chalk.bold('↖')}`,
  [DirectionalAdverbs.SE]: chalk.yellowBright`SE ${chalk.bold('↘')}`,
  [DirectionalAdverbs.SW]: chalk.yellowBright`SW ${chalk.bold('↙')}`,
  [DirectionalAdverbs.Up]: chalk.yellowBright`Up ${chalk.bold('⤴')}`,
  [DirectionalAdverbs.Down]: chalk.yellowBright`Down ${chalk.bold('⤵')}`,
}

const entityNameText = {
  [EntityNames.PathGroup]: chalk.blueBright(EntityNames.PathGroup),
  [EntityNames.Path]: chalk.cyanBright(EntityNames.Path),
  [EntityNames.Matcher]: chalk.greenBright(EntityNames.Matcher),
  [EntityNames.PartitionedMap]: chalk.yellowBright(EntityNames.PartitionedMap),
}

const severityText = {
  [ErrorSeverity.Error]: chalk.black.bgRed(ErrorSeverity.Error),
  [ErrorSeverity.Warning]: chalk.black.bgYellow(ErrorSeverity.Warning),
  [ErrorSeverity.Info]: `${chalk.whiteBright.bold(
    'ⓘ'
  )} ${chalk.whiteBright.bold(ErrorSeverity.Info)}`,
}

const transports = {
  [ErrorSeverity.Error]: console.error,
  [ErrorSeverity.Warning]: console.warn,
  [ErrorSeverity.Info]: console.info,
}

export const entityLogger =
  (entity: EntityNames, phase: ErrorPhase = ErrorPhase.Compile) =>
  (text: string, severity: ErrorSeverity = ErrorSeverity.Info) =>
    transports[severity](
      `${severityText[severity]}: ${entityNameText[entity]} ${text
        .replace(
          entityNameValues,
          (match) => entityNameText[match as EntityNames]
        )
        .replace(
          directionValues,
          (match) => directionText[match as DirectionalAdverbs]
        )}`
    )

export type EntityLogger = ReturnType<typeof entityLogger>

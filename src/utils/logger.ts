import chalk from 'chalk'
import { ErrorPhase, ErrorSeverity } from '../types/Errors'
import { EntityNames } from '../types/EntityNames'

const entityNameValues = new RegExp(
  `${Object.values(EntityNames).join('(?:s)?|')}`,
  'gi'
)

const entityNameText = {
  [EntityNames.PathGroup]: chalk.blueBright(EntityNames.PathGroup),
  [EntityNames.Path]: chalk.cyanBright(EntityNames.Path),
  [EntityNames.Matcher]: chalk.greenBright(EntityNames.Matcher),
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
      `${severityText[severity]}: ${entityNameText[entity]} ${text.replace(
        entityNameValues,
        (match) => entityNameText[match]
      )}`
    )

export type EntityLogger = ReturnType<typeof entityLogger>

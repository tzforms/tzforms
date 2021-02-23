import OriginateStep from '~types/OriginateStep';

export interface BuilderOriginateProps {
    michelson: string;
    michelsonStorage: string;
    visible: boolean;
    step: OriginateStep;
    onCancel?: () => void;
    onStepUpdate: (step: OriginateStep) => void;
}
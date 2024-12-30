class ResolutionWorkflow {
    constructor({
        workflowId,
        characteristicId,
        primarySource,
        mergeMethod,
        fallbackRules
    }) {
        this.workflowId = workflowId;
        this.characteristicId = characteristicId;
        this.primarySource = primarySource;
        this.mergeMethod = mergeMethod;
        this.fallbackRules = fallbackRules;
    }
}

module.exports = ResolutionWorkflow;
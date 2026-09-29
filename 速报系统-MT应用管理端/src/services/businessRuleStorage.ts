import { InstitutionBusinessRules } from '../types';
import { initialGlobalBusinessRules } from '../data/globalBusinessRules';

const GLOBAL_RULES_STORAGE_KEY = 'platform_global_business_rules';

export const businessRuleStorage = {
  readGlobalRules: (): InstitutionBusinessRules => {
    try {
      const saved = localStorage.getItem(GLOBAL_RULES_STORAGE_KEY);
      if (!saved) return initialGlobalBusinessRules;
      const parsed = JSON.parse(saved);
      return {
        ...initialGlobalBusinessRules,
        ...parsed,
        templates: parsed.templates || initialGlobalBusinessRules.templates,
        scoringRuleGroups: parsed.scoringRuleGroups || initialGlobalBusinessRules.scoringRuleGroups,
        scoringDimensions: parsed.scoringDimensions || initialGlobalBusinessRules.scoringDimensions,
        dictItems: parsed.dictItems || initialGlobalBusinessRules.dictItems,
        assessmentRules: parsed.assessmentRules || initialGlobalBusinessRules.assessmentRules,
        metricsFormula: parsed.metricsFormula || initialGlobalBusinessRules.metricsFormula,
        reviewNodes: parsed.reviewNodes || initialGlobalBusinessRules.reviewNodes,
        valueAddedServices: parsed.valueAddedServices || initialGlobalBusinessRules.valueAddedServices,
        otherConfig: parsed.otherConfig || initialGlobalBusinessRules.otherConfig,
        loginAuth: parsed.loginAuth || initialGlobalBusinessRules.loginAuth,
      };
    } catch {
      return initialGlobalBusinessRules;
    }
  },

  saveGlobalRules: (rules: InstitutionBusinessRules) => {
    try {
      localStorage.setItem(GLOBAL_RULES_STORAGE_KEY, JSON.stringify(rules));
      window.dispatchEvent(new CustomEvent('global_business_rules_updated', { detail: rules }));
    } catch {
      // Storage may be unavailable in private or restricted browser contexts.
    }
  },
};

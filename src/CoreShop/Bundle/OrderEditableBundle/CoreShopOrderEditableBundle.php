<?php

declare(strict_types=1);

/*
 * CoreShop
 *
 * This source file is available under two different licenses:
 *  - GNU General Public License version 3 (GPLv3)
 *  - CoreShop Commercial License (CCL)
 * Full copyright and license information is available in
 * LICENSE.md which is distributed with this source code.
 *
 * @copyright  Copyright (c) CoreShop GmbH (https://www.coreshop.org)
 * @license    https://www.coreshop.org/license     GPLv3 and CCL
 *
 */

namespace CoreShop\Bundle\OrderEditableBundle;

use CoreShop\Bundle\CurrencyBundle\CoreShopCurrencyBundle;
use CoreShop\Bundle\CustomerBundle\CoreShopCustomerBundle;
use CoreShop\Bundle\MoneyBundle\CoreShopMoneyBundle;
use CoreShop\Bundle\OrderBundle\CoreShopOrderBundle;
use CoreShop\Bundle\PaymentBundle\CoreShopPaymentBundle;
use CoreShop\Bundle\ResourceBundle\AbstractResourceBundle;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Bundle\RuleBundle\CoreShopRuleBundle;
use CoreShop\Bundle\StorageListBundle\CoreShopStorageListBundle;
use CoreShop\Bundle\StoreBundle\CoreShopStoreBundle;
use CoreShop\Bundle\WorkflowBundle\CoreShopWorkflowBundle;
use Pimcore\HttpKernel\BundleCollection\BundleCollection;
use Symfony\Component\DependencyInjection\ContainerBuilder;

final class CoreShopOrderEditableBundle extends AbstractResourceBundle
{
//    private OrderEditableFeatureChecker $featureChecker;
//
//    public function __construct(OrderEditableFeatureChecker $featureChecker)
//    {
//        $this->featureChecker = $featureChecker;
//    }

    public function getSupportedDrivers(): array
    {
        return [
            CoreShopResourceBundle::DRIVER_DOCTRINE_ORM,
        ];
    }

    public function build(ContainerBuilder $container): void
    {
        parent::build($container);
    }

    public static function registerDependentBundles(BundleCollection $collection): void
    {
        parent::registerDependentBundles($collection);

        $collection->addBundle(new CoreShopWorkflowBundle(), 3600);
        $collection->addBundle(new CoreShopRuleBundle(), 3500);
        $collection->addBundle(new CoreShopCustomerBundle(), 3100);
        $collection->addBundle(new CoreShopCurrencyBundle(), 2700);
        $collection->addBundle(new CoreShopStoreBundle(), 2500);
        $collection->addBundle(new CoreShopPaymentBundle(), 2200);
        $collection->addBundle(new CoreShopMoneyBundle(), 1550);
        $collection->addBundle(new CoreShopOrderBundle(), 1550);
        $collection->addBundle(new CoreShopStorageListBundle(), 100);
    }

    protected function getModelNamespace(): string
    {
        return 'CoreShop\Component\Order\Model';
    }
}

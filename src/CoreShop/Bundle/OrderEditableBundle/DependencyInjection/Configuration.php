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

namespace CoreShop\Bundle\OrderEditableBundle\DependencyInjection;

use CoreShop\Bundle\OrderEditableBundle\Controller\OrderEditableController;
use CoreShop\Bundle\ResourceBundle\CoreShopResourceBundle;
use CoreShop\Component\Order\Model\Order;
use CoreShop\Component\Order\Model\OrderInterface;
use CoreShop\Component\Resource\Factory\Factory;
use Symfony\Component\Config\Definition\Builder\ArrayNodeDefinition;
use Symfony\Component\Config\Definition\Builder\TreeBuilder;
use Symfony\Component\Config\Definition\ConfigurationInterface;

final class Configuration implements ConfigurationInterface
{
    private $featureChecker;

    public function getConfigTreeBuilder(): TreeBuilder
    {
        $treeBuilder = new TreeBuilder('core_shop_order_editable');
        /** @var ArrayNodeDefinition $rootNode */
        $rootNode = $treeBuilder->getRootNode();

        $rootNode
            ->children()
                ->booleanNode('legacy_serialization')->defaultTrue()->end()
            ->end()
            ->append($this->buildFlagsConfiguration())
        ;
        $this->addModelsSection($rootNode);
        $this->addPimcoreResourcesSection($rootNode);

        return $treeBuilder;
    }

    private function buildFlagsConfiguration(): ArrayNodeDefinition
    {
        $treeBuilder = new ArrayNodeDefinition('flags');

        $treeBuilder
            ->addDefaultsIfNotSet()
            ->children()
                ->booleanNode('order_editable')->defaultValue(false)->end()
            ->end()
        ;

        return $treeBuilder;
    }

    private function addModelsSection(ArrayNodeDefinition $node): void
    {
        $node
            ->children()
                ->arrayNode('resources')
                    ->addDefaultsIfNotSet()
                ->end()
                ->arrayNode('pimcore')
                    ->addDefaultsIfNotSet()
                    ->children()
                        ->arrayNode('order_editable')
                        ->addDefaultsIfNotSet()
                        ->children()
                            ->arrayNode('classes')
                            ->addDefaultsIfNotSet()
                            ->children()
                                ->scalarNode('model')->defaultValue(Order::class)->cannotBeEmpty()->end()
                                ->scalarNode('interface')->defaultValue(OrderInterface::class)->cannotBeEmpty()->end()
                                ->scalarNode('admin_controller')->defaultValue(OrderEditableController::class)->cannotBeEmpty()->end()
                                ->scalarNode('type')->defaultValue(CoreShopResourceBundle::PIMCORE_MODEL_TYPE_OBJECT)->cannotBeOverwritten(true)->end()
                                ->scalarNode('factory')->defaultValue(Factory::class)->cannotBeEmpty()->end()
                            ->end()
                        ->end()
                    ->end()
                ->end()
            ->end()
        ;
    }

    private function addPimcoreResourcesSection(ArrayNodeDefinition $node): void
    {
        $node->children()
            ->arrayNode('pimcore_admin')
                ->addDefaultsIfNotSet()
                ->children()
                    ->arrayNode('js')
                        ->useAttributeAsKey('name')
                        ->prototype('scalar')->end()
                    ->end()
                    ->arrayNode('css')
                        ->useAttributeAsKey('name')
                        ->prototype('scalar')->end()
                    ->end()
                ->end()
            ->end()
        ->end()
        ;
    }
}

<?php

namespace Drupal\paragraphs\Plugin\Field\FieldWidget;

use Drupal\Component\Utility\NestedArray;
use Drupal\Component\Utility\Html;
use Drupal\Core\Entity\Entity\EntityFormDisplay;
use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Entity\RevisionableInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldFilteredMarkup;
use Drupal\Core\Field\FieldStorageDefinitionInterface;
use Drupal\Core\Field\WidgetBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Form\SubformState;
use Drupal\Core\Render\Element;
use Drupal\paragraphs;
use Drupal\paragraphs\ParagraphInterface;
use Drupal\paragraphs\Plugin\EntityReferenceSelection\ParagraphSelection;

/**
 * Plugin implementation of the 'entity_reference_revisions paragraphs' widget.
 *
 * @FieldWidget(
 *   id = "paragraphs",
 *   label = @Translation("Paragraphs EXPERIMENTAL"),
 *   description = @Translation("An experimental paragraphs inline form widget."),
 *   field_types = {
 *     "entity_reference_revisions"
 *   }
 * )
 */
class ParagraphsWidget extends WidgetBase {

  /**
   * Indicates whether the current widget instance is in translation.
   *
   * @var bool
   */
  protected $isTranslating;

  /**
   * Id to name ajax buttons that includes field parents and field name.
   *
   * @var string
   */
  protected $fieldIdPrefix;

  /**
   * Wrapper id to identify the paragraphs.
   *
   * @var string
   */
  protected $fieldWrapperId;

  /**
   * Number of paragraphs item on form.
   *
   * @var int
   */
  protected $realItemCount;

  /**
   * Parents for the current paragraph.
   *
   * @var array
   */
  protected $fieldParents;

  /**
   * Accessible paragraphs types.
   *
   * @var array
   */
  protected $accessOptions = NULL;

  /**
   * {@inheritdoc}
   */
  public static function defaultSettings() {
    return array(
      'title' => t('Paragraph'),
      'title_plural' => t('Paragraphs'),
      'edit_mode' => 'open',
      'add_mode' => 'dropdown',
      'form_display_mode' => 'default',
      'default_paragraph_type' => '',
    );
  }

  /**
   * {@inheritdoc}
   */
  public function settingsForm(array $form, FormStateInterface $form_state) {
    $elements = array();

    $elements['title'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Paragraph Title'),
      '#description' => $this->t('Label to appear as title on the button as "Add new [title]", this label is translatable'),
      '#default_value' => $this->getSetting('title'),
      '#required' => TRUE,
    );

    $elements['title_plural'] = array(
      '#type' => 'textfield',
      '#title' => $this->t('Plural Paragraph Title'),
      '#description' => $this->t('Title in its plural form.'),
      '#default_value' => $this->getSetting('title_plural'),
      '#required' => TRUE,
    );

    $elements['edit_mode'] = array(
      '#type' => 'select',
      '#title' => $this->t('Edit mode'),
      '#description' => $this->t('The mode the paragraph is in by default. Preview will render the paragraph in the preview view mode.'),
      '#options' => array(
        'open' => $this->t('Open'),
        'closed' => $this->t('Closed'),
        'preview' => $this->t('Preview'),
      ),
      '#default_value' => $this->getSetting('edit_mode'),
      '#required' => TRUE,
    );

    $elements['add_mode'] = array(
      '#type' => 'select',
      '#title' => $this->t('Add mode'),
      '#description' => $this->t('The way to add new paragraphs.'),
      '#options' => array(
        'select' => $this->t('Select list'),
        'button' => $this->t('Buttons'),
        'dropdown' => $this->t('Dropdown button')
      ),
      '#default_value' => $this->getSetting('add_mode'),
      '#required' => TRUE,
    );

    $elements['form_display_mode'] = array(
      '#type' => 'select',
      '#options' => \Drupal::service('entity_display.repository')->getFormModeOptions($this->getFieldSetting('target_type')),
      '#description' => $this->t('The form display mode to use when rendering the paragraph form.'),
      '#title' => $this->t('Form display mode'),
      '#default_value' => $this->getSetting('form_display_mode'),
      '#required' => TRUE,
    );

    $options  = [];
    foreach ($this->getAllowedTypes() as $key => $bundle) {
      $options[$key] = $bundle['label'];
    }

    $elements['default_paragraph_type'] = [
      '#type' => 'select',
      '#title' => $this->t('Default paragraph type'),
      '#empty_value' => '_none',
      '#default_value' => $this->getDefaultParagraphTypeMachineName(),
      '#options' => $options,
      '#description' => $this->t('When creating a new host entity, a paragraph of this type is added.'),
    ];

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function settingsSummary() {
    $summary = array();
    $summary[] = $this->t('Title: @title', ['@title' => $this->getSetting('title')]);
    $summary[] = $this->t('Plural title: @title_plural', [
      '@title_plural' => $this->getSetting('title_plural')
    ]);

    switch($this->getSetting('edit_mode')) {
      case 'open':
      default:
        $edit_mode = $this->t('Open');
        break;
      case 'closed':
        $edit_mode = $this->t('Closed');
        break;
      case 'preview':
        $edit_mode = $this->t('Preview');
        break;
    }

    switch($this->getSetting('add_mode')) {
      case 'select':
      default:
        $add_mode = $this->t('Select list');
        break;
      case 'button':
        $add_mode = $this->t('Buttons');
        break;
      case 'dropdown':
        $add_mode = $this->t('Dropdown button');
        break;
    }

    $summary[] = $this->t('Edit mode: @edit_mode', ['@edit_mode' => $edit_mode]);
    $summary[] = $this->t('Add mode: @add_mode', ['@add_mode' => $add_mode]);
    $summary[] = $this->t('Form display mode: @form_display_mode', [
      '@form_display_mode' => $this->getSetting('form_display_mode')
    ]);
    if ($this->getDefaultParagraphTypeLabelName() !== NULL) {
      $summary[] = $this->t('Default paragraph type: @default_paragraph_type', [
        '@default_paragraph_type' => $this->getDefaultParagraphTypeLabelName()
      ]);
    }

    return $summary;
  }

  /**
   * {@inheritdoc}
   *
   * @see \Drupal\content_translation\Controller\ContentTranslationController::prepareTranslation()
   *   Uses a similar approach to populate a new translation.
   */
  public function formElement(FieldItemListInterface $items, $delta, array $element, array &$form, FormStateInterface $form_state) {
    $field_name = $this->fieldDefinition->getName();
    $parents = $element['#field_parents'];
    $info = [];

    /** @var \Drupal\paragraphs\Entity\Paragraph $paragraphs_entity */
    $paragraphs_entity = NULL;
    $host = $items->getEntity();
    $widget_state = static::getWidgetState($parents, $field_name, $form_state);

    $entity_manager = \Drupal::entityTypeManager();
    $target_type = $this->getFieldSetting('target_type');

    $item_mode = isset($widget_state['paragraphs'][$delta]['mode']) ? $widget_state['paragraphs'][$delta]['mode'] : 'edit';
    $default_edit_mode = $this->getSetting('edit_mode');

    $show_must_be_saved_warning = !empty($widget_state['paragraphs'][$delta]['show_warning']);

    if (isset($widget_state['paragraphs'][$delta]['entity'])) {
      $paragraphs_entity = $widget_state['paragraphs'][$delta]['entity'];
    }
    elseif (isset($items[$delta]->entity)) {
      $paragraphs_entity = $items[$delta]->entity;

      // We don't have a widget state yet, get from selector settings.
      if (!isset($widget_state['paragraphs'][$delta]['mode'])) {

        if ($default_edit_mode == 'open') {
          $item_mode = 'edit';
        }
        elseif ($default_edit_mode == 'closed') {
          $item_mode = 'closed';
        }
        elseif ($default_edit_mode == 'preview') {
          $item_mode = 'preview';
        }
      }
    }
    elseif (isset($widget_state['selected_bundle'])) {

      $entity_type = $entity_manager->getDefinition($target_type);
      $bundle_key = $entity_type->getKey('bundle');

      $paragraphs_entity = $entity_manager->getStorage($target_type)->create(array(
        $bundle_key => $widget_state['selected_bundle'],
      ));

      $item_mode = 'edit';
    }

    if ($item_mode == 'closed') {
      // Validate closed paragraphs and expand if needed.
      // @todo Consider recursion.
      $violations = $paragraphs_entity->validate();
      $violations->filterByFieldAccess();
      if (count($violations) > 0) {
        $item_mode = 'edit';
        $messages = [];
        foreach ($violations as $violation) {
          $messages[] = $violation->getMessage();
        }
        $info['validation_error'] = $this->createMessage($this->t('@messages', ['@messages' => strip_tags(implode('\n', $messages))]));
      }
    }

    if ($paragraphs_entity) {
      // Detect if we are translating.
      $this->initIsTranslating($form_state, $host);
      $langcode = $form_state->get('langcode');

      if (!$this->isTranslating) {
        // Set the langcode if we are not translating.
        $langcode_key = $paragraphs_entity->getEntityType()->getKey('langcode');
        if ($paragraphs_entity->get($langcode_key)->value != $langcode) {
          // If a translation in the given language already exists, switch to
          // that. If there is none yet, update the language.
          if ($paragraphs_entity->hasTranslation($langcode)) {
            $paragraphs_entity = $paragraphs_entity->getTranslation($langcode);
          }
          else {
            $paragraphs_entity->set($langcode_key, $langcode);
          }
        }
      }
      else {
        // Add translation if missing for the target language.
        if (!$paragraphs_entity->hasTranslation($langcode)) {
          // Get the selected translation of the paragraph entity.
          $entity_langcode = $paragraphs_entity->language()->getId();
          $source = $form_state->get(['content_translation', 'source']);
          $source_langcode = $source ? $source->getId() : $entity_langcode;
          $paragraphs_entity = $paragraphs_entity->getTranslation($source_langcode);
          // The paragraphs entity has no content translation source field if
          // no paragraph entity field is translatable, even if the host is.
          if ($paragraphs_entity->hasField('content_translation_source')) {
            // Initialise the translation with source language values.
            $paragraphs_entity->addTranslation($langcode, $paragraphs_entity->toArray());
            $translation = $paragraphs_entity->getTranslation($langcode);
            $manager = \Drupal::service('content_translation.manager');
            $manager->getTranslationMetadata($translation)->setSource($paragraphs_entity->language()->getId());
          }
        }
        // If any paragraphs type is translatable do not switch.
        if ($paragraphs_entity->hasField('content_translation_source')) {
          // Switch the paragraph to the translation.
          $paragraphs_entity = $paragraphs_entity->getTranslation($langcode);
        }
      }

      $element_parents = $parents;
      $element_parents[] = $field_name;
      $element_parents[] = $delta;
      $element_parents[] = 'subform';

      $id_prefix = implode('-', array_merge($parents, array($field_name, $delta)));
      $wrapper_id = Html::getUniqueId($id_prefix . '-item-wrapper');

      $element += array(
        '#type' => 'container',
        '#element_validate' => array(array($this, 'elementValidate')),
        'subform' => array(
          '#type' => 'container',
          '#parents' => $element_parents,
        ),
      );

      $element['#prefix'] = '<div id="' . $wrapper_id . '">';
      $element['#suffix'] = '</div>';

      $item_bundles = \Drupal::service('entity_type.bundle.info')->getBundleInfo($target_type);
      if (isset($item_bundles[$paragraphs_entity->bundle()])) {
        $bundle_info = $item_bundles[$paragraphs_entity->bundle()];

        $element['top'] = array(
          '#type' => 'container',
          '#weight' => -1000,
          '#attributes' => array(
            'class' => array(
              'paragraph-type-top',
            ),
          ),
        );

        $element['top']['paragraph_type_title'] = array(
          '#type' => 'container',
          '#weight' => 0,
          '#attributes' => array(
            'class' => array(
              'paragraph-type-title',
            ),
          ),
        );

        $element['top']['paragraph_type_title']['info'] = array(
          '#markup' => $bundle_info['label'],
        );

        $actions = [];
        $links = [];

        $links['duplicate_button'] = [
          '#type' => 'submit',
          '#value' => $this->t('Duplicate'),
          '#name' => $id_prefix . '_duplicate',
          '#weight' => 502,
          '#submit' => [[get_class($this), 'duplicateSubmit']],
          '#limit_validation_errors' => [array_merge($parents, [$field_name, 'add_more'])],
          '#delta' => $delta,
          '#ajax' => [
            'callback' => [get_class($this), 'itemAjax'],
            'wrapper' => $widget_state['ajax_wrapper_id'],
          ],
          '#access' => $paragraphs_entity->access('update'),
        ];

        if ($item_mode != 'remove') {
          $links['remove_button'] = [
            '#type' => 'submit',
            '#value' => $this->t('Remove'),
            '#name' => $id_prefix . '_remove',
            '#weight' => 501 ,
            '#submit' => [[get_class($this), 'paragraphsItemSubmit']],
            '#limit_validation_errors' => [array_merge($parents, [$field_name, 'add_more'])],
            '#delta' => $delta,
            '#ajax' => [
              'callback' => array(get_class($this), 'itemAjax'),
              'wrapper' => $widget_state['ajax_wrapper_id'],
            ],
            // Hide the button when translating.
            '#access' => $paragraphs_entity->access('delete') && !$this->isTranslating,
            '#paragraphs_mode' => 'remove',
          ];
        }

        if ($item_mode == 'edit') {
          if (isset($paragraphs_entity)) {
            $links['collapse_button'] = [
              '#value' => $this->t('Collapse'),
              '#name' => $id_prefix . '_collapse',
              '#weight' => 499,
              '#submit' => [[get_class($this), 'paragraphsItemSubmit']],
              '#limit_validation_errors' => [array_merge($parents, [$field_name, 'add_more'])],
              '#delta' => $delta,
              '#ajax' => [
                'callback' => [get_class($this), 'itemAjax'],
                'wrapper' => $widget_state['ajax_wrapper_id'],
              ],
              '#access' => $paragraphs_entity->access('update'),
              '#paragraphs_mode' => 'closed',
              '#paragraphs_show_warning' => TRUE,
            ];
          }

          $info['edit_button_info'] = $this->createMessage($this->t('You are not allowed to edit this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('update') && $paragraphs_entity->access('delete')
          ];

          $info['remove_button_info'] = $this->createMessage($this->t('You are not allowed to remove this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('delete') && $paragraphs_entity->access('update')
          ];

          $info['edit_remove_button_info'] = $this->createMessage($this->t('You are not allowed to edit or remove this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('update') && !$paragraphs_entity->access('delete')
          ];
        }
        else {
          $element['top']['paragraphs_edit_button_container'] = [
            '#type' => 'container',
            '#weight' => 1,
            '#attributes' => [
              'class' => [
                'paragraphs-edit-button-container',
              ],
            ],
            'paragraphs_edit_button' => $this->expandButton([
              '#type' => 'submit',
              '#value' => $this->t('Edit'),
              '#name' => $id_prefix . '_edit',
              '#weight' => 500,
              '#attributes' => [
                'class' => [
                  'paragraphs-edit-button',
                ],
              ],
              '#submit' => [[get_class($this), 'paragraphsItemSubmit']],
              '#limit_validation_errors' => [array_merge($parents, [$field_name, 'add_more'])],
              '#delta' => $delta,
              '#ajax' => [
                'callback' => [get_class($this), 'itemAjax'],
                'wrapper' => $widget_state['ajax_wrapper_id'],
              ],
              '#access' => $paragraphs_entity->access('update'),
              '#paragraphs_mode' => 'edit',
            ]),
          ];

          if ($show_must_be_saved_warning) {
            $info['must_be_saved_info'] = $this->createMessage($this->t('You have unsaved changes on this @title item.', array('@title' => $this->getSetting('title'))));
          }

          $info['preview_info'] = $this->createMessage($this->t('You are not allowed to view this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('view')
          ];

          $info['edit_button_info'] = $this->createMessage($this->t('You are not allowed to edit this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('update') && $paragraphs_entity->access('delete')
          ];

          $info['remove_button_info'] = $this->createMessage($this->t('You are not allowed to remove this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('delete') && $paragraphs_entity->access('update')
          ];

          $info['edit_remove_button_info'] = $this->createMessage($this->t('You are not allowed to edit or remove this @title.', array('@title' => $this->getSetting('title')))) + [
            '#access' => !$paragraphs_entity->access('update') && !$paragraphs_entity->access('delete')
          ];
        }

        $context = [
          'form' => $form,
          'widget' => self::getWidgetState($parents, $field_name, $form_state, $widget_state),
          'items' => $items,
          'delta' => $delta,
          'element' => $element,
          'form_state' => $form_state,
          'paragraphs_entity' => $paragraphs_entity,
        ];

        // Allow modules to register buttons for widget actions.
        \Drupal::moduleHandler()->alter('paragraph_widget_dropbutton', $links, $context);

        // Expand all links to proper dropdown button elements.
        $links = array_map([$this, 'expandButton'], $links);

        if (count($links)) {
          $show_links = 0;
          foreach($links as $link_item) {
            if (!isset($link_item['#access']) || $link_item['#access']) {
              $show_links++;
            }
          }

          if ($show_links > 0) {
            // Wrap in dropbutton operations if there's more than one.
            if ($show_links > 1) {
              $links = $this->buildDropbutton($links);
            }

            $links['#weight'] = 1;
            $element['top']['links'] = $links;
          }
        }

        if (count($info)) {
          $show_info = FALSE;
          foreach($info as $info_item) {
            if (!isset($info_item['#access']) || $info_item['#access']) {
              $show_info = TRUE;
              break;
            }
          }

          if ($show_info) {
            $element['info'] = $info;
            $element['info']['#weight'] = 998;
          }
        }

        if (count($actions)) {
          $show_actions = FALSE;
          foreach($actions as $action_item) {
            if (!isset($action_item['#access']) || $action_item['#access']) {
              $show_actions = TRUE;
              break;
            }
          }

          if ($show_actions) {
            $element['actions'] = $actions;
            $element['actions']['#type'] = 'actions';
            $element['actions']['#weight'] = 999;
          }
        }
      }

      $display = EntityFormDisplay::collectRenderDisplay($paragraphs_entity, $this->getSetting('form_display_mode'));

      // @todo Remove as part of https://www.drupal.org/node/2640056
      if (\Drupal::moduleHandler()->moduleExists('field_group')) {
        $context = [
          'entity_type' => $paragraphs_entity->getEntityTypeId(),
          'bundle' => $paragraphs_entity->bundle(),
          'entity' => $paragraphs_entity,
          'context' => 'form',
          'display_context' => 'form',
          'mode' => $display->getMode(),
        ];

        field_group_attach_groups($element['subform'], $context);
        $element['subform']['#pre_render'][] = 'field_group_form_pre_render';
      }

      if ($item_mode == 'edit') {
        $display->buildForm($paragraphs_entity, $element['subform'], $form_state);
        // Get the field definitions of the paragraphs_entity.
        // We need them to filter out entity reference revisions fields that
        // reference paragraphs, cause otherwise we have problems with showing
        // and hiding the right fields in nested paragraphs.
        $field_definitions = $paragraphs_entity->getFieldDefinitions();

        foreach (Element::children($element['subform']) as $field) {
          // Do a check if we have to add a class to the form element. We need
          // those classes (paragraphs-content and paragraphs-behavior) to show
          // and hide elements, depending of the active perspective.
          $omit_class = FALSE;
          if (isset($field_definitions[$field])) {
            $type = $field_definitions[$field]->getType();
            if ($type == 'entity_reference_revisions') {
              // Check if we are referencing paragraphs.
              $target_entity_type = $field_definitions[$field]->get('entity_type');
              if ($target_entity_type && $target_entity_type == 'paragraph') {
                $omit_class = TRUE;
              }
            }
          }

          if ($paragraphs_entity->hasField($field)) {
            if (!$omit_class) {
              $element['subform'][$field]['#attributes']['class'][] = 'paragraphs-content';
            }
            $translatable = $paragraphs_entity->{$field}->getFieldDefinition()->isTranslatable();
            if ($translatable) {
              $element['subform'][$field]['widget']['#after_build'][] = [
                static::class,
                'removeTranslatabilityClue',
              ];
            }
          }
        }

        // Build the behavior plugins fields.
        $paragraphs_type = $paragraphs_entity->getParagraphType();
        if ($paragraphs_type && \Drupal::currentUser()->hasPermission('edit behavior plugin settings')) {
          $element['behavior_plugins']['#weight'] = -99;
          foreach ($paragraphs_type->getEnabledBehaviorPlugins() as $plugin_id => $plugin) {
            $element['behavior_plugins'][$plugin_id] = [
              '#type' => 'container',
              '#group' => implode('][', array_merge($element_parents, ['paragraph_behavior'])),
            ];
            $subform_state = SubformState::createForSubform($element['behavior_plugins'][$plugin_id], $form, $form_state);
            if ($plugin_form = $plugin->buildBehaviorForm($paragraphs_entity, $element['behavior_plugins'][$plugin_id], $subform_state)) {
              $element['behavior_plugins'][$plugin_id] = $plugin_form;
              // Add the paragraphs-behavior class, so that we are able to show
              // and hide behavior fields, depending on the active perspective.
              $element['behavior_plugins'][$plugin_id]['#attributes']['class'][] = 'paragraphs-behavior';
            }
          }
        }
      }
      elseif ($item_mode == 'preview') {
        $element['subform'] = array();
        $element['behavior_plugins'] = [];
        $element['preview'] = entity_view($paragraphs_entity, 'preview', $paragraphs_entity->language()->getId());
        $element['preview']['#access'] = $paragraphs_entity->access('view');
      }
      elseif ($item_mode == 'closed') {
        $element['subform'] = array();
        $element['behavior_plugins'] = [];
        if ($paragraphs_entity) {
          $summary = $paragraphs_entity->getSummary();
          $element['top']['paragraph_summary']['fields_info'] = [
            '#markup' => $summary,
            '#prefix' => '<div class="paragraphs-collapsed-description">',
            '#suffix' => '</div>',
          ];
        }
      }
      else {
        $element['subform'] = array();
      }

      $element['subform']['#attributes']['class'][] = 'paragraphs-subform';
      $element['subform']['#access'] = $paragraphs_entity->access('update');

      if ($item_mode == 'remove') {
        $element['#access'] = FALSE;
      }

      $widget_state['paragraphs'][$delta]['entity'] = $paragraphs_entity;
      $widget_state['paragraphs'][$delta]['display'] = $display;
      $widget_state['paragraphs'][$delta]['mode'] = $item_mode;

      static::setWidgetState($parents, $field_name, $form_state, $widget_state);
    }
    else {
      $element['#access'] = FALSE;
    }

    return $element;
  }

  /**
   * Returns the sorted allowed types for a entity reference field.
   *
   * @return array
   *   A list of arrays keyed by the paragraph type machine name with the following properties.
   *     - label: The label of the paragraph type.
   *     - weight: The weight of the paragraph type.
   */
  public function getAllowedTypes() {

    $return_bundles = array();
    /** @var \Drupal\Core\Entity\EntityReferenceSelection\SelectionPluginManagerInterface $selection_manager */
    $selection_manager = \Drupal::service('plugin.manager.entity_reference_selection');
    $handler = $selection_manager->getSelectionHandler($this->fieldDefinition);
    if ($handler instanceof ParagraphSelection) {
      $return_bundles = $handler->getSortedAllowedTypes();
    }
    // Support for other reference types.
    else {
      $bundles = \Drupal::service('entity_type.bundle.info')->getBundleInfo($this->getFieldSetting('target_type'));
      $weight = 0;
      foreach ($bundles as $machine_name => $bundle) {
        if (!count($this->getSelectionHandlerSetting('target_bundles'))
          || in_array($machine_name, $this->getSelectionHandlerSetting('target_bundles'))) {

          $return_bundles[$machine_name] = array(
            'label' => $bundle['label'],
            'weight' => $weight,
          );

          $weight++;
        }
      }
    }


    return $return_bundles;
  }

  /**
   * {@inheritdoc}
   */
  public function formMultipleElements(FieldItemListInterface $items, array &$form, FormStateInterface $form_state) {
    $field_name = $this->fieldDefinition->getName();
    $cardinality = $this->fieldDefinition->getFieldStorageDefinition()->getCardinality();
    $this->fieldParents = $form['#parents'];
    $field_state = static::getWidgetState($this->fieldParents, $field_name, $form_state);

    $max = $field_state['items_count'];
    $entity_type_manager = \Drupal::entityTypeManager();

    // Consider adding a default paragraph for new host entities.
    if ($max == 0 && $items->getEntity()->isNew()) {
      $default_type = $this->getDefaultParagraphTypeMachineName();

      // Checking if default_type is not none and if is allowed.
      if ($default_type) {
        // Place the default paragraph.
        $target_type = $this->getFieldSetting('target_type');
        $paragraphs_entity = $entity_type_manager->getStorage($target_type)->create([
          'type' => $default_type,
        ]);
        $field_state['selected_bundle'] = $default_type;
        $display = EntityFormDisplay::collectRenderDisplay($paragraphs_entity, $this->getSetting('form_display_mode'));
        $field_state['paragraphs'][0] = [
          'entity' => $paragraphs_entity,
          'display' => $display,
          'mode' => 'edit',
          'original_delta' => 1
        ];
        $max = 1;
        $field_state['items_count'] = $max;
      }
    }

    $this->realItemCount = $max;
    $is_multiple = $this->fieldDefinition->getFieldStorageDefinition()->isMultiple();

    $title = $this->fieldDefinition->getLabel();
    $description = FieldFilteredMarkup::create(\Drupal::token()->replace($this->fieldDefinition->getDescription()));

    $elements = array();
    $tabs = '';
    $this->fieldIdPrefix = implode('-', array_merge($this->fieldParents, array($field_name)));
    $this->fieldWrapperId = Html::getUniqueId($this->fieldIdPrefix . '-add-more-wrapper');

    // If the parent entity is paragraph add the nested class if not then add
    // the perspective tabs.
    $field_prefix = strtr($this->fieldIdPrefix, '_', '-');
    if ($max > 0 && $items->getEntity()->getEntityTypeId() != 'paragraph') {
      $tabs = '<ul class="paragraphs-tabs tabs primary clearfix"><li id="content" class="tabs__tab"><a href="#' . $field_prefix . '-values">Content</a></li><li id="behavior" class="tabs__tab"><a href="#' . $field_prefix . '-values">Behavior</a></li></ul>';
    }
    else {
      $form['#attributes']['class'][] = 'paragraphs-nested';
    }
    $elements['#prefix'] = '<div class="is-horizontal paragraphs-tabs-wrapper" id="' . $this->fieldWrapperId . '">' . $tabs;
    $elements['#suffix'] = '</div>';

    $field_state['ajax_wrapper_id'] = $this->fieldWrapperId;
    // Persist the widget state so formElement() can access it.
    static::setWidgetState($this->fieldParents, $field_name, $form_state, $field_state);

    if ($max > 0) {
      for ($delta = 0; $delta < $max; $delta++) {

        // Add a new empty item if it doesn't exist yet at this delta.
        if (!isset($items[$delta])) {
          $items->appendItem();
        }

        // For multiple fields, title and description are handled by the wrapping
        // table.
        $element = array(
          '#title' => $is_multiple ? '' : $title,
          '#description' => $is_multiple ? '' : $description,
        );
        $element = $this->formSingleElement($items, $delta, $element, $form, $form_state);

        if ($element) {
          // Input field for the delta (drag-n-drop reordering).
          if ($is_multiple) {
            // We name the element '_weight' to avoid clashing with elements
            // defined by widget.
            $element['_weight'] = array(
              '#type' => 'weight',
              '#title' => $this->t('Weight for row @number', array('@number' => $delta + 1)),
              '#title_display' => 'invisible',
              // Note: this 'delta' is the FAPI #type 'weight' element's property.
              '#delta' => $max,
              '#default_value' => $items[$delta]->_weight ?: $delta,
              '#weight' => 100,
            );
          }

          // Access for the top element is set to FALSE only when the paragraph
          // was removed. A paragraphs that a user can not edit has access on
          // lower level.
          if (isset($element['#access']) && !$element['#access']) {
            $this->realItemCount--;
          }
          else {
            $elements[$delta] = $element;
          }
        }
      }
    }

    $field_state = static::getWidgetState($this->fieldParents, $field_name, $form_state);
    $field_state['real_item_count'] = $this->realItemCount;
    static::setWidgetState($this->fieldParents, $field_name, $form_state, $field_state);

    $elements += [
      '#element_validate' => [[$this, 'multipleElementValidate']],
      '#required' => $this->fieldDefinition->isRequired(),
      '#field_name' => $field_name,
      '#cardinality' => $cardinality,
      '#max_delta' => $max - 1,
    ];

    if ($this->realItemCount > 0) {
      $elements += array(
        '#theme' => 'field_multiple_value_form',
        '#cardinality_multiple' => $is_multiple,
        '#title' => $title,
        '#description' => $description,
      );
    }
    else {
      $classes = $this->fieldDefinition->isRequired() ? ['form-required'] : [];
      $elements += [
        '#type' => 'container',
        '#theme_wrappers' => ['container'],
        '#cardinality_multiple' => TRUE,
        'title' => [
          '#type' => 'html_tag',
          '#tag' => 'strong',
          '#value' => $title,
          '#attributes' => ['class' => $classes],
        ],
        'text' => [
          '#type' => 'container',
          'value' => [
            '#markup' => $this->t('No @title added yet.', ['@title' => $this->getSetting('title')]),
            '#prefix' => '<em>',
            '#suffix' => '</em>',
          ]
        ],
      ];

      if ($description) {
        $elements['description'] = [
          '#type' => 'container',
          'value' => ['#markup' => $description],
          '#attributes' => ['class' => ['description']],
        ];
      }
    }

    $host = $items->getEntity();
    $this->initIsTranslating($form_state, $host);

    if (($this->realItemCount < $cardinality || $cardinality == FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED) && !$form_state->isProgrammed() && !$this->isTranslating) {
      $elements['add_more'] = $this->buildAddActions();
    }

    $elements['#attached']['library'][] = 'paragraphs/drupal.paragraphs.widget';

    return $elements;
  }

  /**
   * {@inheritdoc}
   */
  public function form(FieldItemListInterface $items, array &$form, FormStateInterface $form_state, $get_delta = NULL) {
    $parents = $form['#parents'];

    // Identify the manage field settings default value form.
    if (in_array('default_value_input', $parents, TRUE)) {
      // Since the entity is not reusable neither cloneable, having a default
      // value is not supported.
      return ['#markup' => $this->t('No widget available for: %label.', ['%label' => $items->getFieldDefinition()->getLabel()])];
    }

    return parent::form($items, $form, $form_state, $get_delta);
  }

  /**
   * Add 'add more' button, if not working with a programmed form.
   *
   * @return array
   *    The form element array.
   */
  protected function buildAddActions() {
    if (count($this->getAccessibleOptions()) === 0) {
      if (count($this->getAllowedTypes()) === 0) {
        $add_more_elements['info'] = $this->createMessage($this->t('You are not allowed to add any of the @title types.', ['@title' => $this->getSetting('title')]));
      }
      else {
        $add_more_elements['info'] = $this->createMessage($this->t('You did not add any @title types yet.', ['@title' => $this->getSetting('title')]));
      }

      return $add_more_elements ;
    }

    if ($this->getSetting('add_mode') == 'button' || $this->getSetting('add_mode') == 'dropdown') {
      return $this->buildButtonsAddMode();
    }

    return $this->buildSelectAddMode();
  }

  /**
   * Returns the available paragraphs type.
   *
   * @return array
   *   Available paragraphs types.
   */
  protected function getAccessibleOptions() {
    if ($this->accessOptions !== NULL) {
      return $this->accessOptions;
    }

    $entity_type_manager = \Drupal::entityTypeManager();
    $target_type = $this->getFieldSetting('target_type');
    $bundles = $this->getAllowedTypes();
    $access_control_handler = $entity_type_manager->getAccessControlHandler($target_type);
    $dragdrop_settings = $this->getSelectionHandlerSetting('target_bundles_drag_drop');

    foreach ($bundles as $machine_name => $bundle) {
      if ($dragdrop_settings || (!count($this->getSelectionHandlerSetting('target_bundles'))
          || in_array($machine_name, $this->getSelectionHandlerSetting('target_bundles')))) {
        if ($access_control_handler->createAccess($machine_name)) {
          $this->accessOptions[$machine_name] = $bundle['label'];
        }
      }
    }

    return $this->accessOptions;
  }

  /**
   * Helper to create a paragraph UI message.
   *
   * @param string $message
   *   Message text.
   * @param bool $access
   *   Form element access.
   * @param string $type
   *   Message type.
   *
   * @return array
   *   Render array of message.
   */
  public function createMessage($message, $type = 'warning') {
    return [
      '#type' => 'container',
      '#markup' => $message,
      '#attributes' => ['class' => ['messages', 'messages--' . $type]],
    ];
  }

  /**
   * Expand link array into a paragrpah widget action button.
   *
   * @param array $link
   *   Link render array.
   *
   * @return array
   *   Button render array.
   */
  public static function expandButton(array $link) {
    $button = $link + [
      '#type' => 'submit',
      '#theme_wrappers' => ['input__submit__paragraph_action'],
    ];

    // Html::getId will give us '-' char in name but we want '_' for now so
    // we use strtr to search&replace '-' to '_'.
    $button['#name'] = strtr(Html::getId($link['#name']), '-', '_');
    $button['#id'] = Html::getUniqueId($button['#name']);

    if (isset($button['#ajax'])) {
      $button['#ajax'] += [
        'effect' => 'fade',
        // Since a normal throbber is added inline, this has the potential to
        // break a layout if the button is located in dropbuttons. Instead,
        // it's safer to just show the fullscreen progress element instead.
        'progress' => ['type' => 'fullscreen'],
      ];
    }

    return $button;
  }

  /**
   * Build drop button.
   *
   * @param array $elements
   *   Elements for drup button.
   *
   * @return array
   *   Drop button array.
   */
  protected function buildDropbutton(array $elements = []) {
    $build = [
      '#type' => 'container',
      '#attributes' => ['class' => ['paragraphs-dropbutton-wrapper']],
    ];

    $operations = [];
    // Because we are cloning the elements into title sub element we need to
    // sort children first.
    foreach (Element::children($elements, TRUE) as $child) {
      // Clone the element as an operation.
      $operations[$child] = ['title' => $elements[$child]];

      // Flag the original element as printed so it doesn't render twice.
      $elements[$child]['#printed'] = TRUE;
    }

    $build['operations'] = [
      '#type' => 'paragraph_operations',
      // Even though operations are run through the "links" element type, the
      // theme system will render any render array passed as a link "title".
      '#links' => $operations,
    ];

    return $build + $elements;
  }

  /**
   * Builds dropdown button for adding new paragraph.
   *
   * @return array
   *   The form element array.
   */
  protected function buildButtonsAddMode() {
    $options = $this->getAccessibleOptions();

    // Build the buttons.
    $add_more_elements = [];
    foreach ($options as $machine_name => $label) {
      $add_more_elements['add_more_button_' . $machine_name] = $this->expandButton([
        '#type' => 'submit',
        '#name' => $this->fieldIdPrefix . '_' . $machine_name . '_add_more',
        '#value' => $this->t('Add @type', ['@type' => $label]),
        '#attributes' => ['class' => ['field-add-more-submit']],
        '#limit_validation_errors' => [array_merge($this->fieldParents, [$this->fieldDefinition->getName(), 'add_more'])],
        '#submit' => [[get_class($this), 'addMoreSubmit']],
        '#ajax' => [
          'callback' => [get_class($this), 'addMoreAjax'],
          'wrapper' => $this->fieldWrapperId,
        ],
        '#bundle_machine_name' => $machine_name,
      ]);
    }

    // Determine if buttons should be rendered as dropbuttons.
    if (count($options) > 1 && $this->getSetting('add_mode') == 'dropdown') {
      $add_more_elements = $this->buildDropbutton($add_more_elements);
      $add_more_elements['#suffix'] = $this->t('to %type', ['%type' => $this->fieldDefinition->getLabel()]);
    }

    $add_more_elements['#weight'] = 1;

    return $add_more_elements;
  }

  /**
   * Builds list of actions based on paragraphs type.
   *
   * @return array
   *   The form element array.
   */
  protected function buildSelectAddMode() {
    $field_name = $this->fieldDefinition->getName();
    $title = $this->fieldDefinition->getLabel();
    $add_more_elements['add_more_select'] = [
      '#type' => 'select',
      '#options' => $this->getAccessibleOptions(),
      '#title' => $this->t('@title type', ['@title' => $this->getSetting('title')]),
      '#label_display' => 'hidden',
    ];

    $text = $this->t('Add @title', ['@title' => $this->getSetting('title')]);

    if ($this->realItemCount > 0) {
      $text = $this->t('Add another @title', ['@title' => $this->getSetting('title')]);
    }

    $add_more_elements['add_more_button'] = [
      '#type' => 'submit',
      '#name' => strtr($this->fieldIdPrefix, '-', '_') . '_add_more',
      '#value' => $text,
      '#attributes' => ['class' => ['field-add-more-submit']],
      '#limit_validation_errors' => [array_merge($this->fieldParents, [$field_name, 'add_more'])],
      '#submit' => [[get_class($this), 'addMoreSubmit']],
      '#ajax' => [
        'callback' => [get_class($this), 'addMoreAjax'],
        'wrapper' => $this->fieldWrapperId,
        'effect' => 'fade',
      ],
    ];

    $add_more_elements['add_more_button']['#suffix'] = $this->t(' to %type', ['%type' => $title]);
    return $add_more_elements;
  }

  /**
   * {@inheritdoc}
   */
  public static function addMoreAjax(array $form, FormStateInterface $form_state) {
    $button = $form_state->getTriggeringElement();
    // Go one level up in the form, to the widgets container.
    $element = NestedArray::getValue($form, array_slice($button['#array_parents'], 0, -2));

    // Add a DIV around the delta receiving the Ajax effect.
    $delta = $element['#max_delta'];
    $element[$delta]['#prefix'] = '<div class="ajax-new-content">' . (isset($element[$delta]['#prefix']) ? $element[$delta]['#prefix'] : '');
    $element[$delta]['#suffix'] = (isset($element[$delta]['#suffix']) ? $element[$delta]['#suffix'] : '') . '</div>';

    return $element;
  }

  /**
   * {@inheritdoc}
   */
  public static function addMoreSubmit(array $form, FormStateInterface $form_state) {
    $button = $form_state->getTriggeringElement();

    // Go one level up in the form, to the widgets container.
    $element = NestedArray::getValue($form, array_slice($button['#array_parents'], 0, -2));
    $field_name = $element['#field_name'];
    $parents = $element['#field_parents'];

    // Increment the items count.
    $widget_state = static::getWidgetState($parents, $field_name, $form_state);

    if ($widget_state['real_item_count'] < $element['#cardinality'] || $element['#cardinality'] == FieldStorageDefinitionInterface::CARDINALITY_UNLIMITED) {
      $widget_state['items_count']++;
    }

    if (isset($button['#bundle_machine_name'])) {
      $widget_state['selected_bundle'] = $button['#bundle_machine_name'];
    }
    else {
      $widget_state['selected_bundle'] = $element['add_more']['add_more_select']['#value'];
    }

    static::setWidgetState($parents, $field_name, $form_state, $widget_state);

    $form_state->setRebuild();
  }

  /**
   * Creates a duplicate of the paragraph entity.
   */
  public static function duplicateSubmit(array $form, FormStateInterface $form_state) {
    $button = $form_state->getTriggeringElement();
    // Go one level up in the form, to the widgets container.
    $element = NestedArray::getValue($form, array_slice($button['#array_parents'], 0, -4));
    $field_name = $element['#field_name'];
    $parents = $element['#field_parents'];

    // Inserting new element in the array.
    $widget_state = static::getWidgetState($parents, $field_name, $form_state);
    $delta = $button['#delta'];
    $widget_state['items_count']++;
    $widget_state['real_item_count']++;
    $widget_state['original_deltas'] = array_merge($widget_state['original_deltas'], ['1' => 1]) ;

    // Check if the replicate module is enabled
    if (\Drupal::hasService('replicate.replicator')) {
      $duplicate_entity = \Drupal::getContainer()->get('replicate.replicator')->replicateEntity($widget_state['paragraphs'][$delta]['entity']);
      }
    else {
      $duplicate_entity = $widget_state['paragraphs'][$delta]['entity']->createDuplicate();
     }
    // Create the duplicated paragraph and insert it below the original.
    $paragraph[] = [
      'entity' => $duplicate_entity,
      'display' => $widget_state['paragraphs'][$delta]['display'],
      'mode' => 'edit'
    ];

    array_splice($widget_state['paragraphs'], $delta + 1, 0, $paragraph);

    static::setWidgetState($parents, $field_name, $form_state, $widget_state);
    $form_state->setRebuild();
  }

  public static function paragraphsItemSubmit(array $form, FormStateInterface $form_state) {
    $button = $form_state->getTriggeringElement();

    // Go one level up in the form, to the widgets container.
    $element = NestedArray::getValue($form, array_slice($button['#array_parents'], 0, -4));

    $delta = array_slice($button['#array_parents'], -4, -3);
    $delta = $delta[0];

    $field_name = $element['#field_name'];
    $parents = $element['#field_parents'];

    $widget_state = static::getWidgetState($parents, $field_name, $form_state);

    $widget_state['paragraphs'][$delta]['mode'] = $button['#paragraphs_mode'];

    if (!empty($button['#paragraphs_show_warning'])) {
      $widget_state['paragraphs'][$delta]['show_warning'] = $button['#paragraphs_show_warning'];
    }

    static::setWidgetState($parents, $field_name, $form_state, $widget_state);

    $form_state->setRebuild();
  }

  public static function itemAjax(array $form, FormStateInterface $form_state) {
    $button = $form_state->getTriggeringElement();
    // Go one level up in the form, to the widgets container.
    $element = NestedArray::getValue($form, array_slice($button['#array_parents'], 0, -4));

    $element['#prefix'] = '<div class="ajax-new-content">' . (isset($element['#prefix']) ? $element['#prefix'] : '');
    $element['#suffix'] = (isset($element['#suffix']) ? $element['#suffix'] : '') . '</div>';

    return $element;
  }

  /**
   * Returns the value of a setting for the entity reference selection handler.
   *
   * @param string $setting_name
   *   The setting name.
   *
   * @return mixed
   *   The setting value.
   */
  protected function getSelectionHandlerSetting($setting_name) {
    $settings = $this->getFieldSetting('handler_settings');
    return isset($settings[$setting_name]) ? $settings[$setting_name] : NULL;
  }

  /**
   * {@inheritdoc}
   */
  public function elementValidate($element, FormStateInterface $form_state, $form) {
    $field_name = $this->fieldDefinition->getName();
    $widget_state = static::getWidgetState($element['#field_parents'], $field_name, $form_state);
    $delta = $element['#delta'];

    if (isset($widget_state['paragraphs'][$delta]['entity'])) {
      $entity = $widget_state['paragraphs'][$delta]['entity'];

      /** @var \Drupal\Core\Entity\Display\EntityFormDisplayInterface $display */
      $display = $widget_state['paragraphs'][$delta]['display'];

      if ($widget_state['paragraphs'][$delta]['mode'] == 'edit') {
        // Extract the form values on submit for getting the current paragraph.
        $display->extractFormValues($entity, $element['subform'], $form_state);
        $display->validateFormValues($entity, $element['subform'], $form_state);

        // Validate all enabled behavior plugins.
        $paragraphs_type = $entity->getParagraphType();
        if (\Drupal::currentUser()->hasPermission('edit behavior plugin settings')) {
          foreach ($paragraphs_type->getEnabledBehaviorPlugins() as $plugin_id => $plugin_values) {
            $subform_state = SubformState::createForSubform($element['behavior_plugins'][$plugin_id], $form_state->getCompleteForm(), $form_state);
            $plugin_values->validateBehaviorForm($entity, $element['behavior_plugins'][$plugin_id], $subform_state);
          }
        }
      }
    }

    static::setWidgetState($element['#field_parents'], $field_name, $form_state, $widget_state);
  }

   /**
   * Special handling to validate form elements with multiple values.
   *
   * @param array $elements
   *   An associative array containing the substructure of the form to be
   *   validated in this call.
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *   The current state of the form.
   * @param array $form
   *   The complete form array.
   */
  public function multipleElementValidate(array $elements, FormStateInterface $form_state, array $form) {
    $field_name = $this->fieldDefinition->getName();
    $widget_state = static::getWidgetState($elements['#field_parents'], $field_name, $form_state);

    $remove_mode_item_count = $this->getNumberOfParagraphsInMode($widget_state, 'remove');
    $non_remove_mode_item_count = $widget_state['real_item_count'] - $remove_mode_item_count;

    if ($elements['#required'] && $non_remove_mode_item_count < 1) {
      $form_state->setError($elements, t('@name field is required.', ['@name' => $this->fieldDefinition->getLabel()]));
    }

    static::setWidgetState($elements['#field_parents'], $field_name, $form_state, $widget_state);
  }

  /**
   * {@inheritdoc}
   */
  public function massageFormValues(array $values, array $form, FormStateInterface $form_state) {
    $field_name = $this->fieldDefinition->getName();
    $widget_state = static::getWidgetState($form['#parents'], $field_name, $form_state);
    $element = NestedArray::getValue($form_state->getCompleteForm(), $widget_state['array_parents']);

    foreach ($values as $delta => &$item) {
      if (isset($widget_state['paragraphs'][$item['_original_delta']]['entity'])
        && $widget_state['paragraphs'][$item['_original_delta']]['mode'] != 'remove') {
        $paragraphs_entity = $widget_state['paragraphs'][$item['_original_delta']]['entity'];

        /** @var \Drupal\Core\Entity\Display\EntityFormDisplayInterface $display */
        $display =  $widget_state['paragraphs'][$item['_original_delta']]['display'];
        if ($widget_state['paragraphs'][$item['_original_delta']]['mode'] == 'edit') {
          $display->extractFormValues($paragraphs_entity, $element[$item['_original_delta']]['subform'], $form_state);
        }
        // A content entity form saves without any rebuild. It needs to set the
        // language to update it in case of language change.
        $langcode_key = $paragraphs_entity->getEntityType()->getKey('langcode');
        if ($paragraphs_entity->get($langcode_key)->value != $form_state->get('langcode')) {
          // If a translation in the given language already exists, switch to
          // that. If there is none yet, update the language.
          if ($paragraphs_entity->hasTranslation($form_state->get('langcode'))) {
            $paragraphs_entity = $paragraphs_entity->getTranslation($form_state->get('langcode'));
          }
          else {
            $paragraphs_entity->set($langcode_key, $form_state->get('langcode'));
          }
        }
        if (isset($item['behavior_plugins'])) {
          // Submit all enabled behavior plugins.
          $paragraphs_type = $paragraphs_entity->getParagraphType();
          foreach ($paragraphs_type->getEnabledBehaviorPlugins() as $plugin_id => $plugin_values) {
            if (!isset($item['behavior_plugins'][$plugin_id])) {
              $item['behavior_plugins'][$plugin_id] = [];
            }
            if (isset($element[$delta]) && isset($element[$delta]['behavior_plugins'][$plugin_id]) && $form_state->getCompleteForm() && \Drupal::currentUser()->hasPermission('edit behavior plugin settings')) {
              $subform_state = SubformState::createForSubform($element[$delta]['behavior_plugins'][$plugin_id], $form_state->getCompleteForm(), $form_state);
              if (isset($item['behavior_plugins'][$plugin_id])) {
                $plugin_values->submitBehaviorForm($paragraphs_entity, $item['behavior_plugins'][$plugin_id], $subform_state);
              }
            }
          }
        }

        $paragraphs_entity->setNeedsSave(TRUE);
        $item['entity'] = $paragraphs_entity;
        $item['target_id'] = $paragraphs_entity->id();
        $item['target_revision_id'] = $paragraphs_entity->getRevisionId();
      }
      // If our mode is remove don't save or reference this entity.
      // @todo: Maybe we should actually delete it here?
      elseif($widget_state['paragraphs'][$item['_original_delta']]['mode'] == 'remove') {
        $item['target_id'] = NULL;
        $item['target_revision_id'] = NULL;
      }
    }
    return $values;
  }

  /**
   * {@inheritdoc}
   */
  public function extractFormValues(FieldItemListInterface $items, array $form, FormStateInterface $form_state) {
    // Filter possible empty items.
    $items->filterEmptyItems();
    return parent::extractFormValues($items, $form, $form_state);
  }

  /**
   * Initializes the translation form state.
   *
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   * @param \Drupal\Core\Entity\EntityInterface $host
   */
  protected function initIsTranslating(FormStateInterface $form_state, EntityInterface $host) {
    if ($this->isTranslating != NULL) {
      return;
    }
    $this->isTranslating = FALSE;
    if (!$host->isTranslatable()) {
      return;
    }
    if (!$host->getEntityType()->hasKey('default_langcode')) {
      return;
    }
    $default_langcode_key = $host->getEntityType()->getKey('default_langcode');
    if (!$host->hasField($default_langcode_key)) {
      return;
    }

    if (!empty($form_state->get('content_translation'))) {
      // Adding a language through the ContentTranslationController.
      $this->isTranslating = TRUE;
    }
    if ($host->hasTranslation($form_state->get('langcode')) && $host->getTranslation($form_state->get('langcode'))->get($default_langcode_key)->value == 0) {
      // Editing a translation.
      $this->isTranslating = TRUE;
    }
  }

  /**
   * After-build callback for removing the translatability clue from the widget.
   *
   * If the fields on the paragraph type are translatable,
   * ContentTranslationHandler::addTranslatabilityClue()adds an
   * "(all languages)" suffix to the widget title. That suffix is incorrect and
   * is being removed by this method using a #after_build on the field widget.
   *
   * @param array $element
   * @param \Drupal\Core\Form\FormStateInterface $form_state
   *
   * @return array
   */
  public static function removeTranslatabilityClue(array $element, FormStateInterface $form_state) {
    // Widgets could have multiple elements with their own titles, so remove the
    // suffix if it exists, do not recurse lower than this to avoid going into
    // nested paragraphs or similar nested field types.
    $suffix = ' <span class="translation-entity-all-languages">(' . t('all languages') . ')</span>';
    if (isset($element['#title']) && strpos($element['#title'], $suffix)) {
      $element['#title'] = str_replace($suffix, '', $element['#title']);
    }
    // Loop over all widget deltas.
    foreach (Element::children($element) as $delta) {
      if (isset($element[$delta]['#title']) && strpos($element[$delta]['#title'], $suffix)) {
        $element[$delta]['#title'] = str_replace($suffix, '', $element[$delta]['#title']);
      }
      // Loop over all form elements within the current delta.
      foreach (Element::children($element[$delta]) as $field) {
        if (isset($element[$delta][$field]['#title']) && strpos($element[$delta][$field]['#title'], $suffix)) {
          $element[$delta][$field]['#title'] = str_replace($suffix, '', $element[$delta][$field]['#title']);
        }
      }
    }
    return $element;
  }

  /**
   * Returns the default paragraph type.
   *
   * @return string $default_paragraph_type
   *   Label name for default paragraph type.
   */
  protected function getDefaultParagraphTypeLabelName(){
    if ($this->getDefaultParagraphTypeMachineName() !== NULL) {
      $allowed_types = $this->getAllowedTypes();
      return $allowed_types[$this->getDefaultParagraphTypeMachineName()]['label'];
    }

    return NULL;
  }

  /**
   * Returns the machine name for default paragraph type.
   *
   * @return string
   *   Machine name for default paragraph type.
   */
  protected function getDefaultParagraphTypeMachineName() {
    $default_type = $this->getSetting('default_paragraph_type');
    $allowed_types = $this->getAllowedTypes();
    if ($default_type && isset($allowed_types[$default_type])) {
      return $default_type;
    }
    // Check if the user explicitly selected not to have any default Paragraph
    // type. Othewise, if there is only one type available, that one is the
    // default.
    if ($default_type === '_none') {
      return NULL;
    }
    if (count($allowed_types) === 1) {
      return key($allowed_types);
    }

    return NULL;
  }

  /**
   * Counts the number of paragraphs in a certain mode in a form substructure.
   *
   * @param array $widget_state
   *   The widget state for the form substructure containing information about
   *   the paragraphs within.
   * @param string $mode
   *   The mode to look for.
   *
   * @return int
   *   The number of paragraphs is the given mode.
   */
  protected function getNumberOfParagraphsInMode(array $widget_state, $mode) {
    if (!isset($widget_state['paragraphs'])) {
      return 0;
    }

    $paragraphs_count = 0;
    foreach ($widget_state['paragraphs'] as $paragraph) {
      if ($paragraph['mode'] == $mode) {
        $paragraphs_count++;
      }
    }

    return $paragraphs_count;
  }

  /**
   * {@inheritdoc}
   */
  public static function isApplicable(FieldDefinitionInterface $field_definition) {
    $target_type = $field_definition->getSetting('target_type');
    $paragraph_type = \Drupal::entityTypeManager()->getDefinition($target_type);
    if ($paragraph_type) {
      return $paragraph_type->isSubclassOf(ParagraphInterface::class);
    }

    return FALSE;
  }

}
